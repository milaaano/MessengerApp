#!/bin/bash

brew services start postgresql

node ./backend/src/index.js