import React from 'react';
import { Form, Link } from 'react-router-dom';
import { Button, Checkbox, Grid, Header, Icon, Input } from 'semantic-ui-react';
import Base from './Base';

function Settings() {
  return Base({
    top_right_layout: (
      <Link to="/">
        <Button icon="home" floated="right" />
      </Link>
    ),
    sensor_layout: (
      <>
        <div>
          <Input size="mini" fluid placeholder="Name" name="name" />
          <p />
          <Input size="mini" fluid placeholder="Name" name="name" />
          <p />
          <Input size="mini" fluid placeholder="Name" name="name" />
          <p />
          <Input size="mini" fluid placeholder="Name" name="name" />
          <p />
          <Input size="mini" fluid placeholder="Name" name="name" />
        </div>
      </>
    ),
    motor_layout: (
      <>
        <div>
          <Input size="mini" fluid placeholder="Name" name="name" />
          <p />
          <Input size="mini" fluid placeholder="Name" name="name" />
        </div>
      </>
    ),
    bottom_layout: (
      <>
        <Button floated="right" content="Save" />
      </>
    ),
    top_margin: -6,
  });
}

export default Settings;
