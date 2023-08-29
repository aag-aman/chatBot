import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';
import { Config } from '../Config.js';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send'
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  container: {
    width: '300px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    height: '500px', // Set a fixed height for the chat container
    border: 'none', // Remove the border
    overflow: 'hidden', // Hide any overflow content
  },
  bubbleContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    flex: 1,
    padding: '10px',
    scrollbarWidth: 'none', // Hide the scrollbar for Firefox
    '-ms-overflow-style': 'none', // Hide the scrollbar for IE and Edge
    '&::-webkit-scrollbar': {
      width: '0rem',
      background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
    },
  },
  bubble: {
    maxWidth: "70%",
    padding: '10px',
    margin: "5px",
    borderRadius: '8px',
    wordWrap: 'break-word',
    fontSize: '1.2rem',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Add space between input and button
    marginTop: '10px',
    gap: '10px', // Add a gap between input and button
  },
}));

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); //{content: "Hi how can I help you today", role:'assistant'},{content: "Need halp", role:'user'},{content: "Sure?", role:'assistant'}
  const isMounted = useRef(false);
  const classes = useStyles();
  const bubbleContainerRef = useRef(null);
  const [load, setLoad] = useState(false)


    useEffect(() => {

      if (!isMounted.current) {
              isMounted.current = true;
              return;
            }
      // This code will be executed when the component mounts (loads)
      async function fetchData() {
        try {
          // Make the API call
          console.log("Making API Call")
          const response = await axios.get(Config.BASE_URL); 
          console.log(response.data.content)

          const botMessage = {content:response.data.content, role: "assistant"}
          // console.log("Message" + botMessage)
          setMessages([...messages,botMessage])
          // Process the API response and update the state if needed
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

      fetchData(); // Call the function to fetch data
    }, []);

  const scrollToBottom = () => {
    if (bubbleContainerRef.current) {
      bubbleContainerRef.current.scrollTop = bubbleContainerRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (input.trim() !== '') {
      const usrMessage = { content: input, role: "user" };
      setMessages([...messages, usrMessage]);
      setInput('');

      try {
        setLoad(true);
        const response = await axios.post(Config.API_ENDPOINT, { message: input });
        const botMessage = { content: response.data.content, role: "assistant" };
        setMessages(messages => [...messages, botMessage]);
      } catch (error) {
        console.error('Error sending/receiving message:', error);
      }

      setLoad(false);
      scrollToBottom();
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.bubbleContainer} ref={bubbleContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`${message.role} ${classes.bubble}`}>
            {message.content}
          </div>
        ))}
      </div>
      <div className={classes.inputContainer}>
        <TextField
          id="outlined-basic"
          label="Type your message"
          variant="outlined"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field"
          placeholder="Type your message..."
        />
        <LoadingButton
          loading={load}
          loadingPosition="start"
          startIcon={<SendIcon />}
          variant="outlined"
          onClick={sendMessage}
          className="send-button"
        >
          Send
        </LoadingButton>
      </div>
    </div>
  );
};

export default Chat;
