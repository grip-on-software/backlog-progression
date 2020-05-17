import React from 'react';
import { Alert, Card, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import DatePlayer from './DatePlayer';
import ProjectTypeahead from './ProjectTypeahead';
import { alertsSelector, deleteAlert } from '../slices/alerts';
import CirclePackChart from './CirclePackChart';

const App = () => {
  
  const dispatch = useDispatch();
  const { alerts } = useSelector(alertsSelector);

  return(
    <Container>
      <Row>
        <Col>
          <h2 className="my-4">Issue Bubbles Chart</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          {
            alerts.map((alert, idx) => 
              <Alert
                dismissible={alert.dismissible}
                key={idx}
                onClose={() => dispatch(deleteAlert(idx))}
                variant={alert.variant}>
                  {alert.message}
              </Alert>
            )
          }
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <ProjectTypeahead />
              <CirclePackChart />
              <DatePlayer />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
