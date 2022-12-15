import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Grid, Header, Icon } from 'semantic-ui-react';
import Base from './Base';

function GPIO() {
  const onClick = () => {};

  return Base({
    top_right_layout: (
      <Link to="/settings">
        <Button icon="cog" floated="right" />
      </Link>
    ),
    sensor_layout: (
      <>
        <Header as="h4" textAlign="center">
          33.22
        </Header>
        <Header as="h4" textAlign="center">
          22
        </Header>
        <Header as="h4" textAlign="center">
          55/2
        </Header>
        <Header as="h4" textAlign="center">
          44.1
        </Header>
        <Header as="h4" textAlign="center">
          66566
        </Header>
      </>
    ),
    motor_layout: (
      <>
        <Checkbox toggle />
        <p />
        <Checkbox toggle />
      </>
    ),
    bottom_layout: <></>,
    top_margin: 0,
  });
}

export default GPIO;
