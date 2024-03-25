FROM python:3.11


COPY /requirements.txt /python_micro/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /python_micro/requirements.txt

COPY . /python_micro


CMD ["python3", "/python_micro/manage.py", "runserver", "0.0.0.0:3000"]

# If running behind a proxy like Nginx or Traefik add --proxy-headers
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]