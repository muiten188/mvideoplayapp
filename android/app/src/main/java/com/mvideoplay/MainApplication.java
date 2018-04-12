package com.mvideoplay;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.tuanpm.RCTMqtt.RCTMqttPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.RNFetchBlob.RNFetchBlobPackage;  
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import codes.simen.IMEI.IMEI;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RCTMqttPackage(),
            new ReactVideoPackage(), 
            new VectorIconsPackage(),
            new KCKeepAwakePackage(),
            new RNFetchBlobPackage(),
            new RNDeviceInfo(),
            new IMEI()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
