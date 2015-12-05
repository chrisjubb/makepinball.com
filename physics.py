import bge
import bpy
import PhysicsConstraints

#print(dir(PhysicsConstraints))

#print(dir(bpy.data.objects['GHOST']))

print("COL")

PhysicsConstraints.exportBulletFile("output.bullet")