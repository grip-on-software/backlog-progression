import React, { useState, useEffect, useCallback } from 'react';
import { Col, ButtonToolbar, ButtonGroup, Button, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faForward, faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';

import { addAlert } from '../slices/alerts';
import { Release, Sprint, configSelector, setDate, addSprint, updateSprintLabel } from '../slices/config';
import { decreaseSpeed, increaseSpeed, pause, play, playerSelector, playSpeeds, stop } from '../slices/player';

interface Change {
  created: number,
  id: number,
  issueId: number,
  field: "release" | "sprint" | "storyPoints",
  value: Release | Sprint | number | null,
}

interface Props {
  className?: string,
};

let lastChangeIndex = -1;
let timeout: NodeJS.Timeout;

const today = (ms: number) => {
  const date = new Date(ms);
  return new Date(date.toDateString());
}

const tomorrow = (ms: number) => {
  return today(ms + 24 * 60 * 60 * 1000);
}

const DatePlayer = (props: Props) => {
  const dispatch = useDispatch();
  const { date, project, sprints } = useSelector(configSelector);
  const { isPlaying, speed } = useSelector(playerSelector);

  const [changelog, setChangelog] = useState<Change[]>([]);
  const range = {
    min: changelog.length ? today(changelog[0].created).getTime() : 0,
    max: changelog.length ? tomorrow(changelog[changelog.length-1].created).getTime() : 0,
  }

  const applyChanges = useCallback((changes: Change[]) => {
    for (let i = 0; i < changes.length; ++i) {
      console.log(`Issue ${changes[i].issueId}: apply '${changes[i].field}' => ${changes[i].value}`);
    }
  }, []);

  const undoChanges = useCallback((changes: Change[]) => {
    for (let i = changes.length - 1; i >= 0; --i) {
      console.log(`Issue ${changes[i].issueId}: undo '${changes[i].field}' => ${changes[i].value}`);
    }
  }, []);

  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDate(parseInt(event.target.value)));
  }

  const handleFasterClick = () => {
    if (!project) return;
    dispatch(increaseSpeed());
  }

  const handlePlayClick = () => {
    if (!project) return;
    if (isPlaying) {
      dispatch(pause())
    } else {
      dispatch(play());
    }
  }
  
  const handleSlowerClick = () => {
    if (!project) return;
    dispatch(decreaseSpeed())
  }

  const handleStopClick = () => {
    if (!project) return;
    dispatch(stop());
    dispatch(setDate(changelog.length ? changelog[0].created : 0));
  }

  const fetchChangelog = useCallback((projectKey: string) => {
    fetch("data/IES/changelog.json")
      .then((response: Response) => response.json())
      .then((data: Change[]) => setChangelog(data))
      .catch((error: Error) => {
        console.error(error);
        dispatch(addAlert({
          dismissible: false,
          message: "Something went wrong while fetching project history. Please reload the page.",
          variant: "danger"
        }));
      });
  }, [dispatch]);

  useEffect(() => {
    if (!project) return;
    fetchChangelog(project.key);
  }, [fetchChangelog, project]);

  useEffect(() => {
    dispatch(setDate(changelog.length ? changelog[0].created : 0));
  }, [changelog, dispatch]);

  useEffect(() => {
    clearTimeout(timeout);
    if (isPlaying) {
      timeout = setTimeout(() => {
        dispatch(setDate(date + playSpeeds[speed].interval));
      }, 1000);
    }
  }, [date, dispatch, isPlaying, speed]);

  useEffect(() => {
    if (!changelog.length || !date) return;
    
    // No changes have been applied yet.
    if (-1 === lastChangeIndex) {
      const [from, to] = [
        0,
        Math.max(
          0,
          changelog.findIndex(change => change.created > date) - 1
        )
      ];
      lastChangeIndex = to;
      applyChanges(changelog.slice(from, to));
      return;
    }

    // Apply new changes up to the given date.
    if (changelog[lastChangeIndex].created < date) {
      const [from, to] = [
        Math.min(lastChangeIndex + 1, changelog.length - 1),
        changelog.some(change => change.created > date)
          ? changelog.findIndex(change => change.created > date) - 1
          : Math.max(0, changelog.length - 1)
      ];
      lastChangeIndex = to;
      applyChanges(changelog.slice(from, to));
      return;
    }

    // Undo changes up to the given date.
    const [from, to] = [
      Math.max(
        0,
        changelog.findIndex(change => change.created > date)
      ),
      lastChangeIndex];
    lastChangeIndex = Math.max(0, from - 1);
    undoChanges(changelog.slice(from, to));

  }, [applyChanges, changelog, date, dispatch, undoChanges])

  return (
    <fieldset disabled={!project}>
      <Row className="align-items-end">
        <Col xs="auto" className="pr-0">
          <ButtonToolbar className={props.className || ""} aria-label="Toolbar with play/pause buttons and range slider">
            <ButtonGroup size="sm" aria-label="Play control buttons">
              <Button variant="light" onClick={handleSlowerClick} aria-label="Slower" disabled={0 === speed}>
                <FontAwesomeIcon icon={faBackward} />
              </Button>
              <Button variant="light" onClick={handlePlayClick} aria-label="Play">
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </Button>
              <Button variant="light" onClick={handleStopClick} aria-label="Stop">
                <FontAwesomeIcon icon={faStop} />
              </Button>
              <Button variant="light" onClick={handleFasterClick} aria-label="Faster" disabled={playSpeeds.length-1 === speed}>
                <FontAwesomeIcon icon={faForward} />
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
        </Col>
        <Col>
          <Form.Control
            custom
            max={range.max}
            min={range.min}
            onChange={handleRangeChange}
            step={playSpeeds[speed].interval}
            type="range"
            value={date} />
        </Col>
      </Row>
    </fieldset>
  );
};

export default DatePlayer;