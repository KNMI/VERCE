
class MeshArea():
    def __init__(self,minlat, maxlat, minlon, maxlon):
        self.minlat = minlat
        self.maxlat = maxlat
        self.minlon = minlon
        self.maxlon = maxlon

# this will return a list of mesh areas computed from a given min/max latitude and longitude
# with values ranging from -180 to 180 for latitude and -180 to 360 for longitude
def getMeshArea(minlatitude, maxlatitude, minlongitude, maxlongitude):
        if float(minlatitude) < -180 or float(maxlatitude) > 180 or float(minlongitude) < -180 or float(maxlongitude) > 360:
            return None

        elif float(minlatitude) < -90 and float(maxlongitude) > 180:
            return [MeshArea(-90, maxlatitude, float(maxlongitude) - 180, 180),
                    MeshArea(-90, maxlatitude, -180, float(minlongitude)),
                    MeshArea(-90, maxlatitude, 0, float(maxlongitude) - 180),
                    MeshArea(-90, maxlatitude, float(minlongitude), 0)]

        elif float(maxlatitude) > 90 and float(maxlongitude) > 180:
            return [MeshArea(minlatitude, 90, float(maxlongitude) - 180, 180),
                    MeshArea(minlatitude, 90, -180, float(minlongitude)),
                    MeshArea(minlatitude, 90, 0, float(maxlongitude) - 180),
                    MeshArea(minlatitude, 90, float(minlongitude), 0)]

        elif float(maxlongitude) > 180:
            return [MeshArea(minlatitude, maxlatitude, float(maxlongitude) - 180, 180),
                    MeshArea(minlatitude, maxlatitude, -180, float(minlongitude))]

        elif float(minlatitude) < -90:
            return [MeshArea(-90, maxlatitude, minlongitude, maxlongitude)]

        elif float(maxlatitude) > 90:
            return [MeshArea(minlatitude, 90, minlongitude, maxlongitude)]

        else:
            return [MeshArea(minlatitude, maxlatitude, minlongitude, maxlongitude)]