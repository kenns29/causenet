from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from modules.config import BaseConfig

# instantiate the db
db = SQLAlchemy()
migrate = Migrate()


def create_app():
    # instantiate the app
    app = Flask(__name__)
    CORS(app)

    # set config
    app.config.from_object(BaseConfig)

    # register blueprints
    from modules.api.api import blueprint
    app.register_blueprint(blueprint)

    return app
