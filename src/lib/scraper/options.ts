'use server';

import axios from 'axios';

// BrightData proxy configuration
const username = String(process.env.BRIGHT_DATA_USERNAME);
const password = String(process.env.BRIGHT_DATA_PASSWORD);
const port = process.env.BRIGHT_DATA_PORT;
const session_id = (1000000 * Math.random()) | 0;

const options = {
  auth: {
    username: `${username}-session-${session_id}`,
    password,
  },
  host: 'brd.superproxy.io',
  port,
  rejectUnauthorized: false,
};

export async function selectAPI(website: string, name: 'BrightData' | 'Other') {
  if (name === 'BrightData') {
    const resp = await axios.get(website, options);
    return resp;
  } else {
    const resp = await axios.post(String(process.env.LOCAL_SCRAPER), {
      URL: website,
    });
    return resp;
  }
}
