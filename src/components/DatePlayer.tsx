import React from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faForward, faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';

import { Col, Container, ButtonToolbar, ButtonGroup, Button, Form, Row } from 'react-bootstrap';

interface Props {
  className?: string,
};

const DatePlayer = (props: Props) => {
  const dispatch = useDispatch();

  return (
    <Row className="align-items-end">
      <Col xs="auto" className="pr-0">
        <ButtonToolbar className={props.className || ""} aria-label="Toolbar with play/pause buttons and range slider">
          <ButtonGroup size="sm" aria-label="Play control buttons">
            <Button variant="light" aria-label="Slower"><FontAwesomeIcon icon={faBackward} /></Button>
            <Button variant="light" aria-label="Play"><FontAwesomeIcon icon={faPlay} /></Button>
            <Button variant="light" aria-label="Stop"><FontAwesomeIcon icon={faStop} /></Button>
            <Button variant="light" aria-label="Faster"><FontAwesomeIcon icon={faForward} /></Button>
          </ButtonGroup>
        </ButtonToolbar>
      </Col>
      <Col>
        <Form.Control type="range" defaultValue="0" custom />
      </Col>
    </Row>
  );
};

export default DatePlayer;