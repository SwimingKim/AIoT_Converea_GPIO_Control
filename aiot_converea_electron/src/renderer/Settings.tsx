import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Grid, Header, Icon, Input } from 'semantic-ui-react';
import { dlog, getConfig, putConfig } from 'utils/dev';
import Base from './Base';
import pin_config from '../../assets/pin.json';

type PinType = {
  dht22: number;
  turbidity: number;
  ph: number;
  liquid_level: number;
  fan: number;
  pump: number;
};

const PinInput = (
  name: string,
  value: number,
  placeholder: string,
  onChange: (e: React.ChangeEvent, data: any) => void
) => {
  return (
    <Input
      size="mini"
      fluid
      placeholder={placeholder}
      name={name}
      type="number"
      onChange={onChange}
      input={value}
      defaultValue={value}
    />
  );
};

function Settings() {
  const [pins, setPins] = useState({} as PinType);

  useEffect(() => {
    const config = getConfig();
    if (config != null) {
      setPins({ ...JSON.parse(config) });
    } else {
        putConfig(pin_config)
        setPins({ ...pin_config });
    }
  }, []);

  const onChange = (e: any, data: { name: string; value: number }) => {
    const { name, value } = data;
    setPins({
      ...pins,
      [name]: Number(value),
    });
  };

  const onClickSave = () => {
    putConfig(pins);
    dlog('SAVE', pins);
  };

  return Base({
    top_right_layout: (
      <Link to="/">
        <Button icon="home" floated="right" />
      </Link>
    ),
    sensor_layout: (
      <>
        <div>
          {PinInput('dht22', pins.dht22, 'PIN', onChange)}
          <p />
          {PinInput('dht22', pins.dht22, 'PIN', onChange)}
          <p />
          {PinInput('turbidity', pins.turbidity, 'CHANNEL', onChange)}
          <p />
          {PinInput('ph', pins.ph, 'CHANNEL', onChange)}
          <p />
          {PinInput('liquid_level', pins.liquid_level, 'CHANNEL', onChange)}
        </div>
      </>
    ),
    motor_layout: (
      <>
        <div>
          {PinInput('fan', pins.fan, 'PIN', onChange)}
          <p />
          {PinInput('pump', pins.pump, 'PIN', onChange)}
        </div>
      </>
    ),
    button_layout: (
      <>
        <Button floated="right" content="Save" onClick={onClickSave} />
      </>
    ),
    bottom_layout: <></>,
    top_margin: -6,
  });
}

export default Settings;
