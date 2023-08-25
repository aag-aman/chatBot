import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';
import { Config } from '../Config.js';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send'
// import Button from '@mui/material-next/Button';
import makeStyles from '@mui/styles/makeStyles';
import { flexbox } from '@mui/system';

const useStyles = makeStyles(theme => ({
    container: {
      width: '300px',
      border: '1px solid #ccc',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column'
    },
    bubbleContainer: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'scroll'
    },
    bubble: {
      maxWidth: "30%",
      padding: '10px',
      margin: "5px",
      borderRadius: '8px'
    }
}));

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); //{text: "Hi how can I help you today", sender:'bot'},{text: "Bla bla", sender:'user'}
  const [load, setLoad] = useState(false)
  const classes = useStyles();

  const isMounted = useRef(false);

  useEffect(() => {

    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    // This code will be executed when the component mounts (loads)
    async function fetchData() {
      try {
        // Make the API call
        // console.log("Making API Call")
        const response = await axios.get(Config.BASE_URL); 
        // console.log(response.data.content)

        const botMessage = {text:response.data.content, sender: "bot"}
        // console.log("Message" + botMessage)
        setMessages([...messages,botMessage])
        // Process the API response and update the state if needed
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData(); // Call the function to fetch data
  }, []);
  

  const handleInput = (event) => {
    setInput(event.target.value);
    
  };

  const handleSubmit = async () => {
    setLoad(true);
    if (input.trim() !== '') {
      try {
        // Update mesages

        const usrMessage = {text: input, sender: "user"};
        // setMessages([...messages, {text: input, sender: "user"}]);
        // Send the input to the backend API
        // console.log(Config.API_ENDPOINT);
        const response = await axios.post(Config.API_ENDPOINT, { message: input });

        // Update messages with the response data
        const botMessage = {text:response.data.message, sender: "bot"}
        setMessages([...messages, usrMessage, botMessage]);
        

        setInput('');
        
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    setLoad(false);
  };

  return (
    <div className="chat-container">
      <div className="message-container">
      {messages.map((message, index) => (
        <div className={`  ${classes.bubbleContainer}`} >
            <div key={index} className={`${message.sender} ${classes.bubble}`}>
            {message.text}
          </div>
        </div>
        ))}
      </div>
      <div className="input-container">
        <TextField id="outlined-basic" label="Type your message" variant="outlined"
          type="text"
          value={input}
          onChange={handleInput}
          className="input-field"
          placeholder="Type your message..."
        />
        <LoadingButton
          loading={load}
          loadingPosition="start"
          startIcon={<SendIcon />}
          variant="outlined"
          onClick={handleSubmit} className="send-button"
        >
          Send
        </LoadingButton>
        
      </div>
    </div>
  );
};

export default Chat;
