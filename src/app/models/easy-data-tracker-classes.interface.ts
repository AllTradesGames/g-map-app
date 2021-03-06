export interface Activity {
    id: number;
    ownerName: string;
    contactName: string;
    contactAddress: string;
    contactEmail: string;
    contactPhones: string[];
    leadType: string;
    status: ActivityStatus;
    dispositionName: string;
    dispositionId: number;
    //dispositionColor: string; // Used if color is set by EasyDataTracker
    notes: string;
    //latLng: google.maps.LatLng;
    latitude: number;
    longitude: number;
}

export interface User {
    id: number;
    status: UserStatus;
    logonName: string;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    sysPermission: boolean;
}



export enum ActivityStatus {
    PROSPECT,           // Activity is in the prospect state
    LEAD,               // Activity is in the lead state
    TO_BE_SCHEDULED,    // Activity is marked "sold" and is to be scheduled by the office manager
    SCHEDULED,          // The Activity is scheduled and ready for installation
    INSTALL,            // The Activity is currently being installed
    SERVICE_CALL,       // Activity is a service call
    FINAL_PAPERWORK,    // The Installation is complete and the final office paperwork is to be completed
    ARCHIVE             // The Activity is archived
}

export enum UserStatus {
    ENABLED,
    DISABLED,
    LOCKEDOUT
}

