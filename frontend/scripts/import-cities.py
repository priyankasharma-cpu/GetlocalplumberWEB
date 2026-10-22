"""Import public geographic names, not plumbing service coverage, from US Census."""
import urllib.request, zipfile, io, csv, json, re
from pathlib import Path
url='https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_place_national.zip'
with urllib.request.urlopen(url,timeout=60) as response:
    payload=response.read()
with zipfile.ZipFile(io.BytesIO(payload)) as archive:
    data=archive.read(next(n for n in archive.namelist() if n.endswith('.txt'))).decode('utf-8-sig')
delimiter='|' if '|' in data.splitlines()[0] else '\t'
rows=csv.DictReader(io.StringIO(data),delimiter=delimiter)
cities=[]
for row in rows:
    row={k.strip():v.strip() for k,v in row.items()}
    if row['USPS']=='PR':continue
    name=re.sub(r' (city and borough|city and county|consolidated government|metropolitan government|unified government|municipality|borough|village|town|city|CDP)$','',row['NAME'])
    cities.append({'id':row['GEOID'],'name':name,'abbr':row['USPS']})
Path('frontend/src/data/cities.json').write_text(json.dumps(cities,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
Path('frontend/src/data/cities-source.json').write_text(json.dumps({'source':url,'publisher':'U.S. Census Bureau','dataset':'2026 National Places Gazetteer','coverageNotice':'Geographic names only; not provider coverage.','records':len(cities)},indent=2),encoding='utf-8')
print('Imported',len(cities),'Census places')
