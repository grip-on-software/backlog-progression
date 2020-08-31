import { hierarchy, mouse, pack, select } from "d3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Figure } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';

import { configSelector } from "../slices/config";
import { setRange } from "../slices/player";

interface Issue {
  id: number,
  key: string,
  created: number,
}

interface Sprint {
  id: number,
  label: string,
  start: number,
  end: number | null,
  completed: number | null
}

interface SprintState {
  id: number,
  created: number,
  name: string,
  children: any[]
}

interface StatusCategory {
  id: number,
  key: string,
  colorName: string,
  name: string
}

interface Props {
  className?: string,
  height: number,
  margin?: {
    bottom?: number,
    left?: number,
    right?: number,
    top?: number,
  }
}

const CirclePackChart = (props: Props) => {

  const { date, project } = useSelector(configSelector);

  // Maintain references to container and main SVG element.
  const container = useRef<(HTMLElement & Figure<"figure">) | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintState, setSprintState] = useState<number>(-1);
  const [sprintStates, setSprintStates] = useState<SprintState[]>([]);
  const [statusCategories, setStatusCategories] = useState<StatusCategory[]>([]);

  // Ensure responsive chart width.
  const [width, setWidth] = useState<number>(0);

  const sprintPack = useCallback(data => {
    return pack()
        .size([width, props.height])
        .padding(3)
      (hierarchy(data)
        .sum(d => d.value)
        .sort((a,b) => b.value! - a.value!))
  }, [props.height, width]);
  
  const handleResize = useCallback(() => {
    if (container.current!.offsetWidth !== width) {
      setWidth(container.current!.offsetWidth);
    }
  }, [width]);

  useEffect(() => {
    setWidth(container.current!.offsetWidth);
    window.addEventListener("resize", handleResize);
  }, [handleResize]);

  // Define scales, axes, and draw chart.
  const dispatch = useDispatch();

  const fetchIssues = (projectKey: string) => {
    fetch("data/IES/issues.json")
      .then(response => response.json())
      .then((data: Issue[]) => setIssues(data))
      .catch(error => console.warn(error))
  }

  const fetchSprints = (projectKey: string) => {
    fetch("data/IES/sprints.json")
      .then(response => response.json())
      .then((data: Sprint[]) => setSprints(data))
      .catch(error => console.warn(error))
  }

  const fetchSprintStates = (projectKey: string) => {
    fetch("data/IES/states.json")
      .then(response => response.json())
      .then((data: SprintState[]) => setSprintStates(data))
      .catch(error => console.warn(error))
  }

  const fetchStatusCategories = () => {
    fetch("data/statusCategories.json")
      .then(response => response.json())
      .then((data: StatusCategory[]) => setStatusCategories(data))
      .catch(error => console.warn(error))
  }

  useEffect(() => {
    fetchStatusCategories();
  }, []);

  useEffect(() => {
    if (!project) return;
    fetchIssues(project.key);
    fetchSprints(project.key);
    fetchSprintStates(project.key);
  }, [project]);

  useEffect(() => {
    if (!sprintStates.length) return;
    dispatch(setRange([
      sprintStates[0].created,
      sprintStates[sprintStates.length-1].created]));
  }, [dispatch, sprintStates])

  useEffect(() => {
    if (!project) return;
    setSprintState(sprintStates.findIndex(s => s.created > date));
  }, [date, project, sprintStates]);

  useEffect(() => {
    if (-1 === sprintState) return;
    if (!svg.current) return;
    const chart = select(svg.current);
    // console.log("State:", sprintStates[sprintState]);
    const root = sprintPack(sprintStates[sprintState]);

    chart.select(".root")
      .selectAll("circle")
      .data(root.descendants(), (d: any) => {
        switch (d.depth) {
          case 0:
            return "state";
          case 1:
              return `sprint-${d.data.id}`;
          case 2:
            return `statusCategory-${d.parent.data.id}-${d.data.id}`;
          case 3:
            return `issue-${d.parent.parent.data.id}-${d.data.id}`;
        }
        return d.data.id;
      })
      .join(
        enter => enter.append("circle")
          .attr("transform", d => root.r
            ? `translate(${(d.x - root.x)*(width/(root.r*2))+width/2},${(d.y - root.y)*(width/(root.r*2))+width/2})`
            : `translate(${width},${width})`)
          .call(enter => enter
            .transition().duration(750)
            .attr("r", d => root.r ? d.r * (width/(root.r*2)) : 0)),
        update => update
          .call(update => update
            .transition().duration(750)
            .attr("transform", d => root.r
              ? `translate(${(d.x - root.x)*(width/(root.r*2))+width/2},${(d.y - root.y)*(width/(root.r*2))+width/2})`
              : `translate(${width},${width})`)
            .attr("r", d => root.r ? d.r * (width/(root.r*2)) : 0)),
        exit => exit
          .call(exit => exit
            .transition().duration(750)
            .attr("r", 0)
          .remove()),
      )
        .attr("class", (d: any) => {
          let className = "";
          switch (d.depth) {
            case 0:
              className += "state";
              break;
            case 1:
              className += "sprint";
              let sprint = sprints.find(sprint => d.data.id === sprint.id);
              if (sprint && sprint.start <= date && (!sprint.end || sprint.end >= date)) {
                className += " active";
              }
              break;
            case 2:
              className += "status-category";
              let statusCategory = statusCategories.find(statusCategory => d.data.id === statusCategory.id);
              if (statusCategory) {
                className += ` ${statusCategory.key}`;
              }
              break;
            case 3:
              className += "issue";
              if (d.data.unestimated) {
                className += " unestimated";
              }
              break;
          }
          return className;
        })
        .attr("data-id", (d: any) => d.data.id);

      chart.selectAll("circle")
        .on("mouseover", (d: any) => {
          const foreignObject = chart.select(".info-panel")
            .attr("class", "info-panel")
            .attr("x", mouse(svg.current!)[0]+25)
            .attr("y", mouse(svg.current!)[1]-25);
          const panel = foreignObject.select(".card");
          const header = panel.select(".card-header")
          const title = panel.select(".card-title");
          const subtitle = panel.select(".card-subtitle");
          const text = panel.select(".card-text");
          switch (d.depth) {
            case 0:
              header.text("Sprint container");
              title.text("Sprints");
              subtitle.text("");
              text.text("");
              break;
            case 1:
              let sprint = sprints.find(s => d.data.id === s.id);
              header.text("Sprint");
              title.text(sprint ? sprint.label : "Backlog");
              subtitle.text(sprint 
                ? sprint.start 
                  ? sprint.end
                    ? `${new Date(sprint.start).toLocaleString("nl-NL")} - ${new Date(sprint.end).toLocaleString("nl-NL")}`
                    : new Date(sprint.start).toLocaleString("nl-NL")
                  : "Unknown start date"
                : "Unknown start date"
              );
              text.text(`${d.value} story points total`);
              break;
            case 2:
              let statusCategory = statusCategories.find(s => d.data.id === s.id);
              header.text("Status");
              switch (d.data.key) {
                case "undefined":
                  panel.attr("class", "card bg-light");
                  break;
                case "new":
                  panel.attr("class", "card bg-primary text-white");
                  break;
                case "indeterminate":
                  panel.attr("class", "card bg-warning text-white");
                  break;
                case "done":
                  panel.attr("class", "card bg-success text-white");
                  break;
              }
              title.text(statusCategory ? statusCategory.name : "Unknown");
              subtitle.text("");
              text.text(`${d.value} story points total`);
              break;
            case 3:
              const issue = issues.find(issue => d.data.id === issue.id);
              header.text("Issue");
              title.text(issue?.key || "Unknown issue");
              subtitle.text(issue?.created ? new Date(issue?.created).toLocaleString("nl-NL") : "Unknown creation date");
              text.text(`${d.data.value} story points`);
              break;
          }
        })
        .on("mousemove", () => {
          chart.select(".info-panel")
            .attr("x", mouse(svg.current!)[0]+25)
            .attr("y", mouse(svg.current!)[1]-25);
        })
        .on("mouseout", () => {
          chart.select(".info-panel")
            .attr("class", "info-panel d-none")
        });
  }, [date, issues, props.height, sprintPack, sprints, sprintState, sprintStates, statusCategories, width])

  return (
    <Figure ref={container} className={`${props.className} figure-img d-block`}>
      <svg className="chart chart-circlepack" ref={svg} height={width} width={width} viewBox={`0 0 ${width} ${width}`}>
        <g className="root"></g>
        <foreignObject className="info-panel d-none" height={256} width={256}>
          <Card>
            <Card.Header></Card.Header>
            <Card.Body>
              <Card.Title></Card.Title>
              <Card.Subtitle className="text-muted mb-2"></Card.Subtitle>
              <Card.Text></Card.Text>
            </Card.Body>
          </Card>
        </foreignObject>
      </svg>
    </Figure>
  );
};

export default CirclePackChart;