import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index';

// 全局样式
import './assets/styles/global.less';

// Ant Design Vue
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

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
app.use(Antd);

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