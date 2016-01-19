# To run:

```
python -m SimpleHTTPServer 8000
```


# To export from Blender:

Open output.blend

Export as Collada DAE. Place your textures in the root folder.

```
Texture options:
Include UV Textures

Collada Options:
Triangulate
Use Object Instances
Transformation Type: Matrix
```

Save as 'output.dae'





Code to run the actual machine using node.js and Johny Five.

Setup:
```
npm install
```

Connect an Arduino Uno and upload the FirmataStandard firmware from the Arduino IDE examples menu.

Run:
```
node .
```
