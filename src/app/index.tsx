import React from 'react';
import ReactDOM from 'react-dom';
import 'reset-css';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { theme } from './theme';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);


// @ts-ignore
if (module.hot) module.hot.accept(function() {});

