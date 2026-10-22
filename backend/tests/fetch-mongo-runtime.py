"""Retrieve only mongod.exe from MongoDB's official ZIP using validated HTTP ranges.
Optional Windows test setup; tests otherwise use mongodb-memory-server's downloader.
"""
import io
import urllib.request
import zipfile
from pathlib import Path

URL = 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.24.zip'

class RangeFile(io.RawIOBase):
    def __init__(self):
        self.pos = 0
        request = urllib.request.Request(URL, headers={'Range': 'bytes=0-0'})
        with urllib.request.urlopen(request, timeout=30) as response:
            if response.status != 206:
                raise RuntimeError('Server does not support byte ranges')
            self.size = int(response.headers['Content-Range'].split('/')[-1])
    def seekable(self):
        return True
    def tell(self):
        return self.pos
    def seek(self, offset, whence=0):
        self.pos = offset if whence == 0 else self.pos + offset if whence == 1 else self.size + offset
        return self.pos
    def read(self, size=-1):
        size = min(size if size >= 0 else self.size-self.pos, self.size-self.pos)
        if size <= 0:
            return b''
        output = bytearray()
        while size > 0:
            length = min(size, 512*1024)
            last_error = None
            for attempt in range(6):
                try:
                    start = self.pos
                    req = urllib.request.Request(URL, headers={'Range': f'bytes={start}-{start+length-1}'})
                    with urllib.request.urlopen(req, timeout=60) as response:
                        if response.status != 206 or not response.headers.get('Content-Range','').startswith(f'bytes {start}-'):
                            raise RuntimeError('Invalid HTTP range response')
                        chunk = response.read()
                        if len(chunk) != length:
                            raise RuntimeError('Incomplete byte range')
                    break
                except Exception as error:
                    last_error = error
            else:
                raise last_error
            output.extend(chunk)
            self.pos += len(chunk)
            size -= len(chunk)
        return bytes(output)

target = Path('node_modules/.cache/mongo-runtime')
target.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(RangeFile()) as archive:
    member = next(info for info in archive.infolist() if info.filename.endswith('/bin/mongod.exe'))
    print('Extracting official MongoDB server:', member.file_size, 'bytes', flush=True)
    with archive.open(member) as source, (target/'mongod.exe').open('wb') as output:
        while chunk := source.read(1024*1024):
            output.write(chunk)
print('Ready:', target/'mongod.exe', flush=True)
