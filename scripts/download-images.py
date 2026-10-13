import os, sys, urllib.request, json

OUT = os.path.join(os.path.dirname(__file__), "raw")
os.makedirs(OUT, exist_ok=True)

# Pexels photo ids -> local name (free-to-use Pexels License)
IMAGES = {
    # hero candidates (dentist + patient, modern clinic)
    "hero-a": 19879741,
    "hero-b": 3952130,
    "hero-c": 5622026,
    "hero-d": 6812558,
    "hero-e": 3881296,
    # clinic interior / atmosphere
    "clinic-a": 4269265,
    "clinic-b": 6812461,
    "clinic-c": 305567,
    "clinic-d": 4269272,
    "clinic-e": 6812526,
    # services
    "svc-consultation": 6627320,
    "svc-cleaning": 3958092,
    "svc-filling": 3845981,
    "svc-ortho": 13207278,
    "svc-crown": 38362421,
    "svc-implant": 6502305,
    "svc-rootcanal": 4971514,
    "svc-exam": 14235198,
    "svc-checkup2": 4269948,
    # supporting / misc
    "misc-xray": 7800675,
    "misc-tools": 4269682,
    "misc-care": 5622235,
    "misc-team": 37458097,
    "misc-tech": 7800666,
}

def fetch(pid, width):
    url = f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w={width}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

for name, pid in IMAGES.items():
    for width, suffix in ((400, "small"), (1600, "big")):
        path = os.path.join(OUT, f"{name}-{suffix}.jpg")
        if os.path.exists(path) and os.path.getsize(path) > 5000:
            continue
        try:
            data = fetch(pid, width)
            with open(path, "wb") as f:
                f.write(data)
            print(f"OK {name} ({pid}) {suffix} {len(data)} bytes")
        except Exception as e:
            print(f"FAIL {name} ({pid}) {suffix}: {e}")
            break
