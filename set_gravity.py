import bge
import mathutils
import math

table_angle = 7

eul = mathutils.Euler((math.radians(table_angle), 0.0, 0.0), 'XYZ')
vec = mathutils.Vector((0.0, -22.0, 0.0))
vec.rotate(eul)

print("Table angle = %s" % table_angle)
print("Gravity = %s" % vec)

bge.constraints.setGravity(vec.x, vec.z, vec.y)
