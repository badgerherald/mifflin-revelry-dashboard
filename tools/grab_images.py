#!/usr/bin/env python

import bs4
import os
import requests
import shutil

def grab_images(file_in, file_out):
    if not os.path.isdir('img'):
        os.mkdir('img')
    with open(file_in, 'r') as f:
        f_string = f.read()
        tree = bs4.BeautifulSoup(f_string)
    for img in tree.find_all('img'):
        src = img['src'].decode('utf-8').encode('Latin-1')
        if src.lstrip('https://') == src:
            continue
        print "Now downloading %s" % src
        img_parts = src.lstrip('https://').split('/')
        img_file = img_parts[-1]
        img_dir = os.path.join('img', os.path.join(*img_parts[:-1]))
        print img_dir
        if not os.path.isdir(img_dir):
            os.makedirs(img_dir)
        try:
            img_path = os.path.join(img_dir, img_file)
            if not os.path.isfile(img_path):
                r = requests.get(src)
                if r.status_code == 200:
                    with open(img_path, 'w') as f:
                        f.write(r.content)
                    img['src'] = img_path
        except:
            print "Error downloading %s" % src
    with open(file_out, 'w') as f:
        f.write(tree.prettify().encode('utf-8'))

def main():
    shutil.move('index.html', 'index_old.html')
    grab_images('index_old.html', 'index.html')

if __name__ == '__main__':
    main()
