import React, { Component, useState } from 'react';
import icon from '../../../public/img/icon-128.png';

function GreetingComponent(){
  const [name] = useState('dev')
  return (
    <div>
      <p>Hello, {name}!</p>
      <img src={icon} alt="extension icon" />
    </div>
  );
}

export default GreetingComponent;
