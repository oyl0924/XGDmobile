import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index';

// PWA 支持
import { registerSW } from './pwa';

// 注册 Service Worker
registerSW();

// 全局样式
import './assets/styles/global.less';

// Vant UI
import { 
  Popup, 
  Search as SearchBar, 
  List, 
  Tag, 
  Loading as SpinLoading, 
  Stepper, 
  NavBar, 
  Image, 
  Toast 
} from 'vant';
import 'vant/lib/index.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// 注册Vant组件
app.use(Popup);
app.use(SearchBar);
app.use(List);
app.use(Tag);
app.use(SpinLoading);
app.use(Stepper);
app.use(NavBar);
app.use(Image);
app.use(Toast);

app.mount('#app'); 