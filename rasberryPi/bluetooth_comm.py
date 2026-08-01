# bluetooth_comm.py
# Sends single-character commands (L, R, F, S) to the Arduino over the
# rfcomm serial port created by binding the paired HC-05 module.

import time
import serial
import config


class BluetoothLink:
    def __init__(self):
        self.ser = None
        self.prev_command = None
        self.last_command_time = 0
        self._connect()

    def _connect(self):
        try:
            self.ser = serial.Serial(config.BT_PORT, config.BT_BAUD, timeout=1)
            time.sleep(2)  # give the HC-05 a moment to settle after opening the port
            print(f"Bluetooth connected on {config.BT_PORT}")
        except Exception as e:
            print("Bluetooth connection failed:", e)
            self.ser = None

    def send(self, cmd):
        now = time.time()

        if not self.ser:
            print("Bluetooth not connected. Cannot send:", cmd)
            return

        if cmd != self.prev_command or (now - self.last_command_time > config.COMMAND_INTERVAL):
            try:
                self.ser.write(cmd.encode())
                self.prev_command = cmd
                self.last_command_time = now
                print("Sent command:", cmd)
            except Exception as e:
                print("Bluetooth send failed:", e)
                self.ser = None  # force a fresh reconnect attempt next run

    def close(self):
        if self.ser:
            self.ser.close()
