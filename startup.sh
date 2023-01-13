#!/bin/bash

python3 -m venv env
source env/bin/activate

pip install -r TFC_PB/requirements.txt

python3 TFC_PB/manage.py makemigrations
python3 TFC_PB/manage.py migrate

npm --prefix ./TFC_PF install
