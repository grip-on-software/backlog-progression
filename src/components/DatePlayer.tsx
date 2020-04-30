import React, { useState, useEffect, useCallback } from 'react';
import { Col, ButtonToolbar, ButtonGroup, Button, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faForward, faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';

import { addAlert } from '../slices/alerts';
import { Release, configSelector, setDate } from '../slices/config';

interface Sprint {
  id: number,
  label: string,
}

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

const speeds = [
  {
    interval: 43200000,
    label: "12 hours",
  },
  {
    interval: 86400000,
    label: "1 day",
  },
  {
    interval: 172800000,
    label: "2 days",
  },
  {
    interval: 345600000,
    label: "4 days",
  },
  {
    interval: 604800000,
    label: "1 week",
  },
  {
    interval: 1209600000,
    label: "2 weeks",
  }
];

let timeout: NodeJS.Timeout;

const DatePlayer = (props: Props) => {
  const dispatch = useDispatch();
  const { date, project } = useSelector(configSelector);

  const [changelog, setChangelog] = useState<Change[]>([])
  const [play, setPlay] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const range = {
    min: changelog.length ? changelog[0].created : 0,
    max: changelog.length ? changelog[changelog.length-1].created : 0,
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDate(parseInt(event.target.value)));
  }

  const handleFasterClick = () => {
    if (!project) return;
    setSpeed(Math.min(speed+1, speeds.length-1))
  }

  const handlePlayClick = () => {
    if (!project) return;
    setPlay(!play);
  }
  
  const handleSlowerClick = () => {
    if (!project) return;
    setSpeed(Math.max(0, speed-1))
  }

  const handleStopClick = () => {
    if (!project) return;
    setPlay(false);
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
    if (!changelog.length) return;
    dispatch(setDate(changelog[0].created));
  }, [changelog, dispatch]);

  useEffect(() => {
    if (play) {
      timeout = setInterval(() => {
        dispatch(setDate(date + speeds[speed].interval));
        clearInterval(timeout);
      }, 1000);
    } else {
      clearInterval(timeout);
    }
  }, [date, dispatch, play, speed]);

  return (
    <fieldset disabled={!project}>
      <Row className="align-items-end">
        <Col xs="auto" className="pr-0">
          <ButtonToolbar className={props.className || ""} aria-label="Toolbar with play/pause buttons and range slider">
            <ButtonGroup size="sm" aria-label="Play control buttons">
              <Button hidden variant="light" onClick={handleSlowerClick} aria-label="Slower" disabled={0 === speed}>
                <FontAwesomeIcon icon={faBackward} />
              </Button>
              <Button variant="light" onClick={handlePlayClick} aria-label="Play">
                <FontAwesomeIcon icon={play ? faPause : faPlay} />
              </Button>
              <Button variant="light" onClick={handleStopClick} aria-label="Stop">
                <FontAwesomeIcon icon={faStop} />
              </Button>
              <Button hidden variant="light" onClick={handleFasterClick} aria-label="Faster" disabled={speeds.length-1 === speed}>
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
            onChange={handleChange}
            step={speeds[speed].interval}
            type="range"
            value={date} />
        </Col>
      </Row>
    </fieldset>
  );
};

export default DatePlayer;