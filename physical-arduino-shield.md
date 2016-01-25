Key = a missing pin on the jumper to identify it - below as [x]
NC = not connected
Gnd = Ground

Molex jumpers (J1, J2, J3, J4) are read top (pin 1) to bottom and left (pin 1) to right.
The pull up resistors are used on the switch inputs (J3:1,2,3,4,5,7). To activate a switch connect the switch input to ground (J3:8).

```
|-------------------------------------|
| [Gnd]                               |
| [13]                      [NC]      |
| [12]     Arduino Uno   [IOREF]      |
| [11~]     sits here    [RESET]      |
| [10~]                   [3.3V]      |
| [9~]                      [5V]  [1] | J4
| [8]                      [Gnd]  [x] |
|                          [Gnd]  [3] |
| [7]                      [Vin]  [4] |
| [6~]                                |
| [5~]                      [A5]  [1] | J3
| [4]                       [A4]  [2] |
| [3~]                      [A3]  [3] |
| [2]                       [A2]  [4] |
|                           [A1]  [5] |
|                           [A0]  [x] |
|                                 [7] |
|                                 [8] |
|                                     |
|                                     |
|                                     |
| [123456x8] [1234567x]               |
|-------------------------------------|
    J1         J2



J1
-------------
1: Light 1
2: Light 2
3: Light 3
4: Light 4
5: Light 5
6: Light 6
7: Key
8: Ground

J2
-------------
1: Light 7
2: Light 8
3: Light 9
4: Light 10
5: Light 11
6: Light 12
7: Ground
8: Key

J3
-------------
1: Switch 1
2: Switch 2
3: Switch 3
4: Switch 4
5: Switch 5
6: Key
7: Switch 6
8: Ground

J4
-------------
1: +5V
2: Key
3: Ground
4: Not connected

```