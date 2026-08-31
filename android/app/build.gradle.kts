plugins {
    id("com.android.application")
}

android {
    namespace = "org.dpdns.gptcperinthalmanna.polypmna"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.dpdns.gptcperinthalmanna.polypmna"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    val keystorePath = providers.gradleProperty("POLYPMNA_KEYSTORE_PATH").orNull
    val keystorePassword = providers.gradleProperty("POLYPMNA_KEYSTORE_PASSWORD").orNull
    val keyAlias = providers.gradleProperty("POLYPMNA_KEY_ALIAS").orNull
    val keyPassword = providers.gradleProperty("POLYPMNA_KEY_PASSWORD").orNull

    signingConfigs {
        if (keystorePath != null && keystorePassword != null && keyAlias != null && keyPassword != null) {
            create("release") {
                storeFile = file(keystorePath)
                storePassword = keystorePassword
                this.keyAlias = keyAlias
                this.keyPassword = keyPassword
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.findByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
