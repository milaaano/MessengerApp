#!/bin/bash

brew services start postgresql

nodemon ./src/index.js