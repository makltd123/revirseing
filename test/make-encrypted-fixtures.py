# Generates the encrypted test fixtures using pypdf (an independent PDF
# producer), so decryption is tested against bytes this project did not
# itself encrypt. Run: python3 test/make-encrypted-fixtures.py <src.pdf> test/fixtures
import sys
from pypdf import PdfReader, PdfWriter
src = sys.argv[1]
def make(dst, algo, user_pw, owner_pw):
    r = PdfReader(src)
    w = PdfWriter()
    for pg in r.pages: w.add_page(pg)
    w.encrypt(user_password=user_pw, owner_password=owner_pw, algorithm=algo)
    with open(dst,'wb') as f: w.write(f)
    print('wrote', dst, algo, 'user_pw=%r'%user_pw)

base = sys.argv[2]
# RC4-128 with empty user password (owner-locked)
make(f'{base}/enc-rc4-empty.pdf', 'RC4-128', '', 'owner-secret')
# AES-128 with empty user password
make(f'{base}/enc-aes128-empty.pdf', 'AES-128', '', 'owner-secret')
# AES-256 with a user password
make(f'{base}/enc-aes256-pw.pdf', 'AES-256', 'hunter2', 'owner-secret')
