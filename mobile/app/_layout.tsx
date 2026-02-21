import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#14532d',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'PERSÉA',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Registrar Lote',
          }}
        />
        <Stack.Screen
          name="batches"
          options={{
            title: 'Mis Lotes',
          }}
        />
        <Stack.Screen
          name="market"
          options={{
            title: 'Mercado',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Mi Perfil',
          }}
        />
      </Stack>
    </>
  );
}
