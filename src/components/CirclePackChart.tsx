import { hierarchy, pack, select } from "d3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Figure } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';

import { configSelector } from "../slices/config";
import { setRange } from "../slices/player";

interface SprintState {
  id: number,
  created: number,
  name: string,
  children: any[]
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

  const [sprintStates, setSprintStates] = useState<SprintState[]>([]);
  const [sprintState, setSprintState] = useState<number>(-1);

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

  const fetchSprintStates = (projectKey: string) => {
    fetch("data/IES/sprintStates.json")
      .then(response => response.json())
      .then((data: SprintState[]) => setSprintStates(data))
      .catch(error => console.warn(error))
  }

  useEffect(() => {
    if (!project) return;
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
    console.log(sprintStates[sprintState]);
    const root = sprintPack(sprintStates[sprintState]);
    chart.select(".root")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
        .transition()
        .duration(500)
        .attr("transform", d => `translate(${(d.x - root.x)*(width/(root.r*2))+width/2},${(d.y - root.y)*(width/(root.r*2))+props.height/2})`)
        .attr("r", d => d.r * (width/(root.r*2)));
  }, [props.height, sprintPack, sprintState, sprintStates, width])

  return (
    <Figure ref={container} className={`${props.className} figure-img d-block`}>
      <svg className="chart chart-circlepack" ref={svg} height={props.height} width={width} viewBox={`0 0 ${width} ${props.height}`}>
        <g className="root"></g>
      </svg>
    </Figure>
  );
};

export default CirclePackChart;