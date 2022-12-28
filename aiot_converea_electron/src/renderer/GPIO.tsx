import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  dlog,
  getConfig,
  getPinInformation,
  isDebug,
  putConfig,
} from 'utils/dev';
import Base from './Base';
import { Button, Checkbox, CheckboxProps, Header } from 'semantic-ui-react';
import pin_config from '../../assets/pin.json';
import SensorChart from './SensorChart';

const numberOrNull = (value: any, format: number = 2) => {
  if (typeof value == 'number') {
    return Number(value).toFixed(format);
  } else {
    return 'None';
  }
};

export type InputDataType = {
  temperature: number | null;
  humidity: number | null;
  turbidity: number | null;
  ph: number | null;
  water_level: number | null;
};

function GPIO() {
  const [input, setInput] = useState({
    temperature: null,
    humidity: null,
    turbidity: null,
    ph: null,
    water_level: null,
  } as InputDataType);
  const [output, setOutput] = useState({
    fan: {
      enable: true,
      value: false,
    },
    pump: {
      enable: true,
      value: false,
    },
  });

  const onToggleOption = (
    event: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps
  ) => {
    const { name, checked } = data;
    dlog(name, checked);

    setOutput({
      ...output,
      [name]: {
        ...output[name],
        enable: false,
      },
    });

    const pin = JSON.parse(getConfig() as any)[name as any];
    window.electron.ipcRenderer.output(
      [pin, checked ? 1 : 0],
      (data: string) => {
        const json = JSON.parse(data);
        const success = json['result'] == true;
        if ((success && !isDebug()) || (!success && isDebug())) {
          setOutput({
            ...output,
            [name]: {
              enable: true,
              value: json['data'] == 1,
            },
          });
        }
      }
    );
  };

  useEffect(() => {
    const pin = getPinInformation();
    window.electron.ipcRenderer.input(
      [2, pin['dht22'], pin['turbidity'], pin['ph'], pin['water_level']],
      (data: string) => {
        try {
          const json = JSON.parse(data);
          // dlog(json, json['data']);
          const success = json['result'] == true;
          if ((success && !isDebug()) || (!success && isDebug())) {
            setInput(json['data']);
          }
        } catch {}
      }
    );

    window.electron.ipcRenderer.state(
      [pin['fan'], pin['pump']],
      (data: string) => {
        const json = JSON.parse(data);
        dlog(json, json['data']);
        const success = json['result'] == true;
        if ((success && !isDebug()) || (!success && isDebug())) {
          setOutput({
            fan: {
              ...output['fan'],
              value: json['data'][0] == 1,
            },
            pump: {
              ...output['pump'],
              value: json['data'][1] == 1,
            },
          });
        }
      }
    );

    return () => {
      dlog('kill....');
      window.electron.ipcRenderer.kill();
    };
  }, []);

  return Base({
    top_right_layout: (
      <Link to="/settings">
        <Button icon="cog" floated="right" />
      </Link>
    ),
    sensor_layout: (
      <>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.temperature)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.humidity)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.turbidity)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.ph)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.water_level, 0)}
        </Header>
      </>
    ),
    motor_layout: (
      <>
        <Checkbox
          toggle
          name="fan"
          checked={output.fan.value}
          onChange={onToggleOption}
        />
        <p />
        <Checkbox
          toggle
          name="pump"
          checked={output.pump.value}
          onChange={onToggleOption}
        />
      </>
    ),
    db_layout: null,
    button_layout: null,
    bottom_layout: <SensorChart input={input} />,
    top_margin: 0,
  });
}

export default GPIO;
