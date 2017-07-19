
class MeshArea():
    def __init__(self,minlat, maxlat, minlon, maxlon):
        self.minlat = minlat
        self.maxlat = maxlat
        self.minlon = minlon
        self.maxlon = maxlon

# this will return a list of mesh areas computed from a given min/max latitude and longitude
# whose values range from -180 to 180 for latitude and -360 to 360 for longitude
def getMeshArea(minlatitude, maxlatitude, minlongitude, maxlongitude):
        if float(minlatitude) < -180 or float(minlongitude) < -360 or float(maxlatitude) > 180 or float(minlongitude) < -360:
            return None

        elif float(minlatitude) < -90 and float(minlongitude) < -180:
            return [MeshArea(-90, maxlatitude, -180, maxlongitude),
                    MeshArea(-90, maxlatitude, (180 - (-180 - float(minlongitude))), 180)]

        elif float(minlatitude) < -90 and float(maxlongitude) > 180:
            return [MeshArea(-90, maxlatitude, minlongitude, 180),
                    MeshArea(-90, maxlatitude, -180, (-180 + (float(maxlongitude) - 180)))]

        elif float(maxlatitude) > 90 and float(minlongitude) < -180:
            return [MeshArea(minlatitude, 90, -180, maxlongitude),
                    MeshArea(minlatitude, 90, (180 - (-180 - float(minlongitude))), 180)]

        elif float(maxlatitude) > 90 and float(maxlongitude) > 180:
            return [MeshArea(minlatitude, 90, minlongitude, 180),
                    MeshArea(minlatitude, 90, -180, (-180 + (float(maxlongitude) - 180)))]

        elif float(minlongitude) < -180:
            return  [MeshArea(minlatitude, maxlatitude, -180, maxlongitude),
                     MeshArea(minlatitude, maxlatitude, (180 - (-180 - float(minlongitude))), 180)]

        elif float(maxlongitude) > 180:
            return [MeshArea(minlatitude, maxlatitude, minlongitude, 180),
                    MeshArea(minlatitude, maxlatitude, -180, (-180 + (float(maxlongitude) - 180)))]

        elif float(minlatitude) < -90:
            return [MeshArea(-90, maxlatitude, minlongitude, maxlongitude)]

        elif float(maxlatitude) > 90:
            return [MeshArea(minlatitude, 90, minlongitude, maxlongitude)]

        else:
            return [MeshArea(minlatitude, maxlatitude, minlongitude, maxlongitude)]