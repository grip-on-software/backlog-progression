import { hierarchy, pack, select } from "d3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Figure, Table } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';

import { configSelector } from "../slices/config";
import { setRange } from "../slices/player";

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

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintState, setSprintState] = useState<number>(-1);
  const [sprintStates, setSprintStates] = useState<SprintState[]>([]);
  const [statusCategories, setStatusCategories] = useState<StatusCategory[]>([]);

  // Ensure responsive chart width.
  const [width, setWidth] = useState<number>(0);

  const sprintPack = useCallback(data => {
    return pack()
        .size([width, width])
        .padding(3)
      (hierarchy(data)
        .sum(d => d.value)
        .sort((a,b) => b.value! - a.value!))
  }, [width]);
  
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

  const fetchSprints = (projectKey: string) => {
    fetch("data/IES/sprints.json")
      .then(response => response.json())
      .then((data: Sprint[]) => setSprints(data))
      .catch(error => console.warn(error))
  }

  const fetchSprintStates = (projectKey: string) => {
    fetch("data/IES/sprintStates.json")
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
    console.log("State:", sprintStates[sprintState]);
    const root = sprintPack(sprintStates[sprintState]);
    console.log(root.descendants())
    chart.select(".root")
      .selectAll("circle")
      .data(root.descendants(), (d: any) => d.data.key)
      .join("circle")
        .transition()
        .duration(500)
        .attr("class", (d: any) => {
          let className = "";
          switch (d.depth) {
            case 0:
              className += "sprints";
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
              break;
          }
          return className;
        })
        .attr("transform", d => root.r
          ? `translate(${(d.x - root.x)*(width/(root.r*2))+width/2},${(d.y - root.y)*(width/(root.r*2))+width/2})`
          : `translate(${width},${width})`)
        .attr("r", d => root.r ? d.r * (width/(root.r*2)) : 0);

      chart.selectAll("circle")
        .on("mouseover", (d: any) => {
          console.log(d);
          const foreignObject = chart.select(".info-panel")
            .attr("class", "info-panel")
            .attr("x", d.x - Math.min(width, 256)/2)
            .attr("y", d.y + d.r + 10);
          const panel = foreignObject.select(".card");
          const header = panel.select(".card-header")
          const title = panel.select(".card-title");
          switch (d.depth) {
            case 0:
              header.text("Sprint container");
              title.text("Sprints");
              break;
            case 1:
              let sprint = sprints.find(s => d.data.id === s.id);
              header.text("Sprint");
              title.text(sprint ? sprint.label : "Backlog");
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
              break;
            case 3:
              header.text("Issue");
              title.text(d.data.key);
              break;
          }
        })
        .on("mouseout", () => {
          chart.select(".info-panel")
            .attr("class", "info-panel d-none")
        });
  }, [date, sprintPack, sprints, sprintState, sprintStates, statusCategories, width])

  return (
    <Figure ref={container} className={`${props.className} figure-img d-block`}>
      <svg className="chart chart-circlepack" ref={svg} height={width} width={width} viewBox={`0 0 ${width} ${width}`}>
        <g className="root"></g>
        <foreignObject className="info-panel d-none" height={Math.min(256, width)} width={Math.min(256, width)}>
          <Card>
            <Card.Header></Card.Header>
            <Card.Body>
              <Card.Title></Card.Title>
            </Card.Body>
          </Card>
        </foreignObject>
      </svg>
    </Figure>
  );
};

export default CirclePackChart;