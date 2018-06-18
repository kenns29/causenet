from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager, Server

from modules import create_app, db

app = create_app()
manager = Manager(app)
manager.add_command('runserver', Server(host='0.0.0.0', port=8000, threaded=True))

if __name__ == '__main__':
    manager.run()