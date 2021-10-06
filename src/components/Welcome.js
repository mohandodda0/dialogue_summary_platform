import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link, 
  useHistory,
  useLocation
} from "react-router-dom";
import '../App.css';

import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
// import './index.css';

import { Form, Input, Button, Checkbox } from 'antd';


function Welcome(props) {
  let history = useHistory()
  let location = useLocation()
  console.log(location)
  let handleSubmit = (value) => {
    localStorage.setItem('name', value.name)
    props.setNameSet(true)
    history.push({
        pathname: '/rate',
        state: { 
            name: value.name 
        },
      });
  }
  return (
    <div className="App">
        <h2>Welcome to SALT Lab Dialogue Grading Platform!</h2>
        <p>Please click on the info link above to get instructions and information about the system. </p>
        <p>To start grading, we need a unique identifer. This can be your full name, or a unique identity.</p>
        <p>If you join on a different browser/device you will need to put this unique identifier!</p>

        <Form
            name="basic"
            labelCol={{
                span: 8,
            }}
            wrapperCol={{
                span: 16,
            }}
            initialValues={{
                remember: true,
            }}
            onFinish={handleSubmit}
            // onFinishFailed={}
            autoComplete="off"
            >
            <Form.Item
                label="Enter your full name or a unique identifier "
                name="name"
                rules={[
                {
                    required: true,
                    message: 'Please enter your name',
                },
                ]}
            >
                <Input style={{ maxWidth: "250px" }}/>
            </Form.Item>

            <Form.Item
                wrapperCol={{
                offset: 8,
                span: 16,
                }}
            >
                <Button type="primary" htmlType="submit" >
                Submit
                </Button>
            </Form.Item>
            </Form>
    </div>
  );
}

export default Welcome;
