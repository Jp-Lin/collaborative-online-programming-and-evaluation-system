import os
import docker
import uuid
import shutil
from docker.errors import *

client = docker.from_env()

IMAGES_NAME = 'dreamyjpl/coj-executor'
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
TEMP_BUILD_DIR = '{}/temp'.format(CURRENT_DIR)

SOURCE_FILE_NAMES = {
    'java': 'Solution.java',
    'python2.7': 'solution.py',
    'python3.5': 'solution.py',
    'c++': 'solution.cpp'
}

BINARY_NAMES = {
    'java': 'Solution',
    'python2.7': 'solution.py',
    'python3.5': 'solution.py',
    'c++': './a.out'
}

BUILD_COMMANDS = {
    'java': 'javac',
    'python2.7': 'python2',
    'python3.5': 'python3',
    'c++': 'g++'
}

EXECUTE_COMMANDS = {
    'java': 'java',
    'python2.7': 'python2',
    'python3.5': 'python3',
    'c++': ''
}


def load_images():
    '''
      load docker images.
    '''
    try:
        client.images.get(IMAGES_NAME)
    except ImageNotFound:
        print 'Image not found locally. Loading from Dockerhub...'
        client.images.pull(IMAGES_NAME)
    except APIError:
        print 'Image not found locally. Dockerhub is not accessible.'
        return

    print 'Image {} loaded'.format(IMAGES_NAME)


def build_and_run(code, lang):
    '''
      build and execute codes.
    '''

    result = {'build': None, 'run': None}

    source_file_parent_dir_name = uuid.uuid4()
    source_file_host_dir = '{}/{}'.format(TEMP_BUILD_DIR,
                                          source_file_parent_dir_name)
    source_file_guest_dir = '/temp/{}'.format(source_file_parent_dir_name)
    make_dir(source_file_host_dir)

    with open('{}/{}'.format(source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code)

    try:
        client.containers.run(
            image=IMAGES_NAME,
            command='{} {}'.format(
                BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
            volumes={source_file_host_dir: {
                'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print('Source built.')
        result['build'] = 'OK'
    except ContainerError as e:
        print 'Build failed.'
        result['build'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    try:
        log = client.containers.run(
            image=IMAGES_NAME,
            command='{} {}'.format(EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
            volumes={source_file_host_dir: {
                'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print('Executed.')
        print(log)
        result['run'] = log
    except ContainerError as e:
        print 'Execution failed.'
        result['run'] = e.stderr
    finally:
        shutil.rmtree(source_file_host_dir)
        print('Directory {} is removed.'.format(source_file_host_dir))
        return result


def make_dir(dir):
    '''
      make the directory.
    '''
    try:
        os.makedirs(dir)
        print('Directory {} created.'.format(dir))
    except OSError:
        print('Directory {} is not created.'.format(dir))
