// src/config/apiConfig.ts
import { Platform } from "react-native";
//   ________________________________________
//  /                                        \
// | POR FAVOR CAMBIAR ESTA IP A LA DE SU PC |
// \________________________________________/
//                    █
//                    █
//                    █
//                    █
//                    █
//                    █
//                    █
//               _____█______
//               \         /
//                \       /
//                 \     /
//                  \   /
//                   \ /
//                    ▼
const LOCAL_IP = "192.168.68.118";
//                    ▲
//                   / \
//                  /   \
//                 /     \
//                /       \
//               /         \
//              / __________\
//                    █
//                    █
//                    █
//                    █
//                    █
//                    █
//                    █
const PORT = 3001;

export const BASE_URL =
    Platform.OS === "android"
        ? `http://${LOCAL_IP}:${PORT}`
        : `http://${LOCAL_IP}:${PORT}`;

export default {
    BASE_URL,
};
