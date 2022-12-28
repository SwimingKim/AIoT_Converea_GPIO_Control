import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Grid, Header } from 'semantic-ui-react';

type BaseType = {
  top_right_layout: React.ReactNode;
  sensor_layout: React.ReactNode;
  motor_layout: React.ReactNode;
  db_layout: React.ReactNode;
  button_layout: React.ReactNode;
  bottom_layout: React.ReactNode;
  top_margin: number;
};

function Base({
  top_right_layout,
  sensor_layout,
  motor_layout,
  db_layout,
  button_layout,
  bottom_layout,
  top_margin,
}: BaseType) {
  return (
    <Grid container style={{ padding: '5em 0em' }}>
      <Grid.Row>
        <Grid.Column>
          {/* <Header as="h2" icon="plug" content="Uptime Guarantee" /> */}
          <Header
            as="h2"
            icon="microchip"
            floated="left"
            content="AIoT Converea GPIO Control"
          />

          {top_right_layout}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={4}>
        <Grid.Column>
          <Header as="h2">Input</Header>
        </Grid.Column>
        <Grid.Column />
        <Grid.Column>
          <Header as="h2">Output</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={4}>
        <Grid.Column>
          <Header as="h4">Temperature</Header>
          <Header as="h4">Humidity</Header>
          <Header as="h4">Turbidity</Header>
          <Header as="h4">PH Value</Header>
          <Header as="h4">Liquid Level</Header>
        </Grid.Column>

        <Grid.Column style={{ top: top_margin }}>{sensor_layout}</Grid.Column>

        <Grid.Column>
          <Header as="h4">Cooling Fan</Header>
          <Header as="h4">Water Pump</Header>
        </Grid.Column>

        <Grid.Column style={{ top: top_margin }}>{motor_layout}</Grid.Column>
      </Grid.Row>
      {db_layout}
      <Grid.Row>
        <Grid.Column>{button_layout}</Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>{bottom_layout}</Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default Base;
