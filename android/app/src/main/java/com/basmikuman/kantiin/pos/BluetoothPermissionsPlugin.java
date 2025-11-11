package com.basmikuman.kantiin.pos;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "BluetoothPermissions",
    permissions = {
        @Permission(strings = { Manifest.permission.BLUETOOTH }, alias = "bluetooth"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_ADMIN }, alias = "bluetoothAdmin"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_SCAN }, alias = "bluetoothScan"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_CONNECT }, alias = "bluetoothConnect"),
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location")
    }
)
public class BluetoothPermissionsPlugin extends Plugin {

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject result = new JSObject();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+
            boolean hasScan = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) 
                == PackageManager.PERMISSION_GRANTED;
            boolean hasConnect = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) 
                == PackageManager.PERMISSION_GRANTED;
            
            result.put("bluetoothScan", hasScan ? "granted" : "denied");
            result.put("bluetoothConnect", hasConnect ? "granted" : "denied");
        } else {
            // Android < 12
            boolean hasBluetooth = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH) 
                == PackageManager.PERMISSION_GRANTED;
            boolean hasLocation = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) 
                == PackageManager.PERMISSION_GRANTED;
            
            result.put("bluetooth", hasBluetooth ? "granted" : "denied");
            result.put("location", hasLocation ? "granted" : "denied");
        }
        
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+
            requestPermissionForAliases(new String[]{"bluetoothScan", "bluetoothConnect", "location"}, call, "checkPermissions");
        } else {
            // Android < 12
            requestPermissionForAliases(new String[]{"bluetooth", "bluetoothAdmin", "location"}, call, "checkPermissions");
        }
    }
}
