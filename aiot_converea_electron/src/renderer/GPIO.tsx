import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Header, Icon } from 'semantic-ui-react';
import { json } from 'stream/consumers';
import { dlog, getConfig, isDebug } from 'utils/dev';
import Base from './Base';

const numberOrNull = (value: any, format: number = 2) => {
  if (typeof(value) == "number") {
    return Number(value).toFixed(format)
  }
  else {
    return "None"
  }
}

function GPIO() {
  const [input, setInput] = useState({
    temp: null,
    humidity: null,
    turbidity: null,
    ph: null,
    liquid_level: null
  })
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
    data: { name: 'fan' | 'pump'; checked: boolean }
  ) => {
    // dlog(event, data)
    const { name, checked } = data;
    dlog(name, checked);

    setOutput({
      ...output,
      [name]: {
        ...output[name],
        enable: false,
      },
    });

    const pin = JSON.parse(getConfig() as any)[name];
    window.electron.ipcRenderer.output(
      [pin, checked ? 1 : 0],
      (data: string) => {
        const json = JSON.parse(data)
        const success = json["result"] == true
        if ((success && !isDebug()) || (!success && isDebug())) {
          setOutput({
            ...output,
            [name]: {
              enable: true,
              value: json["data"] == 1,
            },
          });
        }
      }
    );
  };

  useEffect(() => {
    const pin = JSON.parse(getConfig() as any);
    window.electron.ipcRenderer.input([2, pin["dht22"], pin["turbidity"], pin["ph"], pin["liquid_level"]],
      (data: string) => {
        const json = JSON.parse(data);
        dlog(json, json["data"])
        const success = json["result"] == true
        if ((success && !isDebug()) || (!success && isDebug())) {
          setInput(json["data"])
        }
      }
    );
  }, [])

  return Base({
    top_right_layout: (
      <Link to="/settings">
        <Button icon="cog" floated="right" />
      </Link>
    ),
    sensor_layout: (
      <>
        <Header as="h4" textAlign="center">
          {/* {input.temp} */}
          {numberOrNull(input.temp)}
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
          {numberOrNull(input.liquid_level, 0)}
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
    bottom_layout: <></>,
    top_margin: 0,
  });
}

export default GPIO;
