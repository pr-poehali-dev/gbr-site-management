import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// Типы данных
interface SecurityZone {
  id: number;
  address: string;
  status: 'armed' | 'disarmed' | 'alarm' | 'emergency' | 'suspended';
  batteryLevel: number;
  lastActivity: string;
  contractStatus: 'active' | 'suspended';
}

interface Employee {
  id: number;
  fullName: string;
  department: string;
  rank: string;
}

const Index = () => {
  const { toast } = useToast();
  const [zones, setZones] = useState<SecurityZone[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedZone, setSelectedZone] = useState<SecurityZone | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [newEmployee, setNewEmployee] = useState({ fullName: '', department: '', rank: '' });
  const [newZone, setNewZone] = useState({ address: '', contractStatus: 'active' as const });
  const [alarmSound] = useState(new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEiAjKr5/OpfCYDF2W86+GSZQ0JRaq+a9K+hWA6v4AvAm5lqunEhDUTJ26+3NN3JSI7kNXTojkRO3rF8N94MTJFltTHsCIYP21IyHKGG1tzQjfJrwcwJY7S0VtFTjgvLMzGbH6+3tKtb41g4PCa4KaWQHfPvwCGTU0JgdqyRLl4uh7yc9JVl3ZZaQJ');

  // Генерация 400 участков
  useEffect(() => {
    const generateZones = () => {
      const generatedZones: SecurityZone[] = [];
      for (let i = 1; i <= 400; i++) {
        const isArmed = Math.random() > 0.3;
        generatedZones.push({
          id: i,
          address: `ул. ${['Ленина', 'Пушкина', 'Советская', 'Мира', 'Гагарина', 'Победы', 'Московская', 'Центральная'][Math.floor(Math.random() * 8)]}, д. ${Math.floor(Math.random() * 200) + 1}`,
          status: isArmed ? 'armed' : 'disarmed',
          batteryLevel: Math.floor(Math.random() * 100) + 1,
          lastActivity: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleString('ru-RU'),
          contractStatus: Math.random() > 0.05 ? 'active' : 'suspended'
        });
      }
      return generatedZones;
    };

    const generateEmployees = () => {
      const names = ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Козлов К.К.', 'Новиков Н.Н.'];
      const departments = ['Патрульная служба', 'Оперативный отдел', 'Служба безопасности', 'Мониторинг'];
      const ranks = ['Рядовой', 'Младший сержант', 'Сержант', 'Старший сержант', 'Лейтенант'];
      
      return names.map((name, index) => ({
        id: index + 1,
        fullName: name,
        department: departments[Math.floor(Math.random() * departments.length)],
        rank: ranks[Math.floor(Math.random() * ranks.length)]
      }));
    };

    setZones(generateZones());
    setEmployees(generateEmployees());

    // Автоматическое срабатывание каждые 5 минут
    const interval = setInterval(() => {
      setZones(prevZones => {
        const newZones = [...prevZones];
        const randomIndex = Math.floor(Math.random() * newZones.length);
        if (newZones[randomIndex].status === 'armed') {
          newZones[randomIndex].status = 'alarm';
          // Воспроизведение звука
          try {
            alarmSound.play();
          } catch (e) {
            console.log('Не удалось воспроизвести звук');
          }
          toast({
            title: "🚨 ТРЕВОГА!",
            description: `Сработала сигнализация на участке ${newZones[randomIndex].address}`,
            variant: "destructive"
          });
        }
        return newZones;
      });
    }, 300000); // 5 минут

    return () => clearInterval(interval);
  }, [toast]);

  const updateZoneStatus = (zoneId: number, newStatus: SecurityZone['status']) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId ? { ...zone, status: newStatus, lastActivity: new Date().toLocaleString('ru-RU') } : zone
      )
    );
  };

  const handleEmergencyCall = (zone: SecurityZone) => {
    updateZoneStatus(zone.id, 'emergency');
    // Переместить в начало списка
    setZones(prevZones => {
      const updatedZones = prevZones.filter(z => z.id !== zone.id);
      return [{ ...zone, status: 'emergency' as const }, ...updatedZones];
    });
    toast({
      title: "🚨 ЭКСТРЕННЫЙ ВЫЗОВ ГБР",
      description: `Выезд на участок ${zone.address}`,
      variant: "destructive"
    });
  };

  const armedZones = zones.filter(z => z.status === 'armed').length;
  const alarmZones = zones.filter(z => z.status === 'alarm').length;
  const emergencyZones = zones.filter(z => z.status === 'emergency').length;

  const getStatusBadge = (status: SecurityZone['status']) => {
    const variants = {
      armed: { variant: 'default' as const, text: 'На охране', icon: 'Shield' },
      disarmed: { variant: 'secondary' as const, text: 'Снят с охраны', icon: 'ShieldOff' },
      alarm: { variant: 'destructive' as const, text: 'ТРЕВОГА', icon: 'AlertTriangle' },
      emergency: { variant: 'destructive' as const, text: 'ВЫЕЗД ГБР', icon: 'Siren' },
      suspended: { variant: 'outline' as const, text: 'Приостановлен', icon: 'Pause' }
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon name={config.icon} size={12} />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Icon name="Shield" size={32} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ГБР - Система управления охранными участками</h1>
              <p className="text-gray-600">Профессиональная система безопасности</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Главная</TabsTrigger>
            <TabsTrigger value="zones">Управление участками</TabsTrigger>
            <TabsTrigger value="monitoring">Мониторинг системы</TabsTrigger>
            <TabsTrigger value="alarm">Управление сигнализацией</TabsTrigger>
            <TabsTrigger value="contracts">Договоры</TabsTrigger>
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          </TabsList>

          {/* Главная страница */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего участков</CardTitle>
                  <Icon name="Building" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{zones.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">На охране</CardTitle>
                  <Icon name="Shield" className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{armedZones}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Тревоги</CardTitle>
                  <Icon name="AlertTriangle" className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{alarmZones}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Экстренные вызовы</CardTitle>
                  <Icon name="Siren" className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{emergencyZones}</div>
                </CardContent>
              </Card>
            </div>

            {/* Реквизиты компании */}
            <Card>
              <CardHeader>
                <CardTitle>ООО "ГБР Безопасность"</CardTitle>
                <CardDescription>Реквизиты компании</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>ИНН:</strong> 7707123456</p>
                  <p><strong>КПП:</strong> 770701001</p>
                  <p><strong>ОГРН:</strong> 1027700123456</p>
                </div>
                <div>
                  <p><strong>Адрес:</strong> г. Москва, ул. Безопасности, д. 1</p>
                  <p><strong>Телефон:</strong> +7 (495) 123-45-67</p>
                  <p><strong>Email:</strong> info@gbr-security.ru</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Управление участками */}
          <TabsContent value="zones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Охранные участки</CardTitle>
                <CardDescription>Управление всеми охранными участками</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Батарея</TableHead>
                      <TableHead>Последняя активность</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.slice(0, 20).map((zone) => (
                      <TableRow key={zone.id} className={zone.status === 'emergency' ? 'bg-red-50' : zone.status === 'alarm' ? 'bg-yellow-50' : ''}>
                        <TableCell>{zone.id}</TableCell>
                        <TableCell>{zone.address}</TableCell>
                        <TableCell>{getStatusBadge(zone.status)}</TableCell>
                        <TableCell>
                          <div className={`text-sm ${zone.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'}`}>
                            {zone.batteryLevel}%
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{zone.lastActivity}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedZone(zone)}>
                                Управление
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Управление участком №{zone.id}</DialogTitle>
                                <DialogDescription>{zone.address}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <Button 
                                  onClick={() => handleEmergencyCall(zone)}
                                  variant="destructive"
                                  className="w-full"
                                >
                                  <Icon name="Siren" className="mr-2 h-4 w-4" />
                                  ВЫЕЗД ГБР
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button 
                                    onClick={() => updateZoneStatus(zone.id, 'armed')}
                                    variant="default"
                                  >
                                    Поставить на охрану
                                  </Button>
                                  <Button 
                                    onClick={() => updateZoneStatus(zone.id, 'disarmed')}
                                    variant="secondary"
                                  >
                                    Снять с охраны
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button variant="outline">Разрядить</Button>
                                  <Button variant="outline">Зарядить</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Мониторинг */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мониторинг состояния системы</CardTitle>
                <CardDescription>Массовые операции с участками</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedEmployees(zones.map(z => z.id))}>
                      Выбрать все
                    </Button>
                    <Button variant="secondary" onClick={() => setSelectedEmployees([])}>
                      Снять выделение
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Button>Поставить на охрану</Button>
                    <Button variant="secondary">Снять с охраны</Button>
                    <Button variant="outline">Разрядить батареи</Button>
                    <Button variant="outline">Зарядить батареи</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Управление сигнализацией */}
          <TabsContent value="alarm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление сигнализацией участков</CardTitle>
                <CardDescription>Тестирование систем сигнализации</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {zones.slice(0, 10).map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Участок №{zone.id}</p>
                        <p className="text-sm text-gray-500">{zone.address}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icon name="TestTube" className="mr-2 h-4 w-4" />
                        Тест сигнализации
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Договоры */}
          <TabsContent value="contracts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Создать новый участок</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Адрес участка</Label>
                    <Input 
                      id="address"
                      value={newZone.address}
                      onChange={(e) => setNewZone({...newZone, address: e.target.value})}
                      placeholder="ул. Примерная, д. 1"
                    />
                  </div>
                  <Button className="w-full">Создать участок</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Управление договорами</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите участок" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.slice(0, 10).map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          Участок №{zone.id} - {zone.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">Приостановить договор</Button>
                    <Button variant="default">Продолжить договор</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Сотрудники */}
          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Создать сотрудника</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">ФИО</Label>
                    <Input 
                      id="fullName"
                      value={newEmployee.fullName}
                      onChange={(e) => setNewEmployee({...newEmployee, fullName: e.target.value})}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Отдел</Label>
                    <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patrol">Патрульная служба</SelectItem>
                        <SelectItem value="operations">Оперативный отдел</SelectItem>
                        <SelectItem value="security">Служба безопасности</SelectItem>
                        <SelectItem value="monitoring">Мониторинг</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rank">Звание</Label>
                    <Select value={newEmployee.rank} onValueChange={(value) => setNewEmployee({...newEmployee, rank: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите звание" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Рядовой</SelectItem>
                        <SelectItem value="junior">Младший сержант</SelectItem>
                        <SelectItem value="sergeant">Сержант</SelectItem>
                        <SelectItem value="senior">Старший сержант</SelectItem>
                        <SelectItem value="lieutenant">Лейтенант</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Создать сотрудника</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Список сотрудников</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employees.map((employee) => (
                      <div key={employee.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-sm text-gray-500">{employee.department} • {employee.rank}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;