import React from 'react';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';

const Popup = () => {

  const sendMessage = () => {
    chrome.runtime.sendMessage(
      {sender: 'Popup'},
      (response) => {
        console.log('response', response);
      }
    )
  };

  return (
    <div>
      <Greetings />
      <button onClick={sendMessage}>send message</button>
    </div>
  );
};

export default Popup;
