import { createApp } from 'vue'

import { createToaster } from '@/components/ui/toast'
import App from './App.vue'
import './style.css'

createApp(App).use(createToaster()).mount('#app')
