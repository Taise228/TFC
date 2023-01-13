#!/bin/bash

source env/bin/activate
python3 TFC_PB/manage.py runserver &

npm --prefix ./TFC_PF start &