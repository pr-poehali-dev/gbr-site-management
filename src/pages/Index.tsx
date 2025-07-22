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
  status: 'armed' | 'disarmed' | 'alarm' | 'emergency' | 'suspended' | 'responding';
  batteryLevel: number;
  lastActivity: string;
  contractStatus: 'active' | 'suspended';
  assignedEmployee?: number;
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
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [newEmployee, setNewEmployee] = useState({ fullName: '', department: '', rank: '' });
  const [newZone, setNewZone] = useState({ address: '', contractStatus: 'active' as const });
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [alarmZonesList, setAlarmZonesList] = useState<SecurityZone[]>([]);
  const [selectedEmployeeForDispatch, setSelectedEmployeeForDispatch] = useState<number | null>(null);


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
      const ranks = ['Рядовой', 'Ефрейтор', 'Младший сержант', 'Сержант', 'Старший сержант', 'Старшина', 'Прапорщик', 'Старший прапорщик', 'Лейтенант', 'Старший лейтенант', 'Капитан', 'Майор', 'Подполковник', 'Полковник', 'Генерал-майор', 'Генерал-лейтенант', 'Генерал-полковник', 'Генерал армии'];
      
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
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAA==');
            audio.play();
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
    const updatedZone = { ...zone, status: 'emergency' as const };
    updateZoneStatus(zone.id, 'emergency');
    // Добавить в список тревог
    setAlarmZonesList(prev => {
      const existing = prev.find(z => z.id === zone.id);
      if (!existing) {
        return [updatedZone, ...prev];
      }
      return prev;
    });
    // Переместить в начало списка
    setZones(prevZones => {
      const updatedZones = prevZones.filter(z => z.id !== zone.id);
      return [updatedZone, ...updatedZones];
    });
    toast({
      title: "🚨 ЭКСТРЕННЫЙ ВЫЗОВ ГБР",
      description: `Выезд на участок ${zone.address}`,
      variant: "destructive"
    });
  };

  // Функции для управления множественным выбором участков
  const handleZoneSelection = (zoneId: number) => {
    setSelectedZones(prev => {
      if (prev.includes(zoneId)) {
        return prev.filter(id => id !== zoneId);
      } else {
        return [...prev, zoneId];
      }
    });
  };

  const handleSelectAllZones = () => {
    if (selectedZones.length === zones.length) {
      setSelectedZones([]);
    } else {
      setSelectedZones(zones.map(z => z.id));
    }
  };

  const handleBulkOperation = (operation: 'arm' | 'disarm' | 'charge' | 'discharge') => {
    const statusMap = {
      arm: 'armed' as const,
      disarm: 'disarmed' as const,
      charge: 'armed' as const, // для зарядки оставляем текущий статус
      discharge: 'disarmed' as const // для разрядки оставляем текущий статус
    };

    selectedZones.forEach(zoneId => {
      if (operation === 'charge' || operation === 'discharge') {
        // Обновляем батарею без изменения статуса
        setZones(prevZones =>
          prevZones.map(zone =>
            zone.id === zoneId 
              ? { ...zone, batteryLevel: operation === 'charge' ? 100 : 0, lastActivity: new Date().toLocaleString('ru-RU') }
              : zone
          )
        );
      } else {
        updateZoneStatus(zoneId, statusMap[operation]);
      }
    });

    toast({
      title: "Операция выполнена",
      description: `${operation === 'arm' ? 'Поставлено на охрану' : operation === 'disarm' ? 'Снято с охраны' : operation === 'charge' ? 'Заряжено' : 'Разряжено'} ${selectedZones.length} участков`,
    });

    setSelectedZones([]);
  };

  // Функция тестирования сигнализации
  const handleAlarmTest = (zone: SecurityZone) => {
    const updatedZone = { ...zone, status: 'alarm' as const };
    updateZoneStatus(zone.id, 'alarm');
    // Добавить в список тревог
    setAlarmZonesList(prev => {
      const existing = prev.find(z => z.id === zone.id);
      if (!existing) {
        return [updatedZone, ...prev];
      }
      return prev;
    });
    
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAA==');
      audio.play();
    } catch (e) {
      console.log('Не удалось воспроизвести звук');
    }
    
    toast({
      title: "🚨 ТЕСТ СИГНАЛИЗАЦИИ",
      description: `Тест сигнализации на участке ${zone.address}`,
      variant: "destructive"
    });
  };

  // Функции для управления сотрудниками
  const handleCreateEmployee = () => {
    if (newEmployee.fullName && newEmployee.department && newEmployee.rank) {
      const employee: Employee = {
        id: employees.length + 1,
        fullName: newEmployee.fullName,
        department: newEmployee.department,
        rank: newEmployee.rank
      };
      setEmployees(prev => [...prev, employee]);
      setNewEmployee({ fullName: '', department: '', rank: '' });
      toast({
        title: "Сотрудник создан",
        description: `${employee.fullName} добавлен в систему`,
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      fullName: employee.fullName,
      department: employee.department,
      rank: employee.rank
    });
  };

  const handleUpdateEmployee = () => {
    if (editingEmployee && newEmployee.fullName && newEmployee.department && newEmployee.rank) {
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === editingEmployee.id 
            ? { ...emp, fullName: newEmployee.fullName, department: newEmployee.department, rank: newEmployee.rank }
            : emp
        )
      );
      setEditingEmployee(null);
      setNewEmployee({ fullName: '', department: '', rank: '' });
      toast({
        title: "Сотрудник обновлён",
        description: `Данные сотрудника успешно изменены`,
      });
    }
  };

  const handleFireEmployee = (employeeId: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({
      title: "Сотрудник уволен",
      description: "Сотрудник удален из системы",
      variant: "destructive"
    });
  };

  // Функция отправки сотрудника на участок
  const handleDispatchEmployee = (zoneId: number, employeeId: number) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId 
          ? { ...zone, status: 'responding' as const, assignedEmployee: employeeId, lastActivity: new Date().toLocaleString('ru-RU') }
          : zone
      )
    );
    
    // Убрать из списка тревог
    setAlarmZonesList(prev => prev.filter(z => z.id !== zoneId));
    
    const employee = employees.find(e => e.id === employeeId);
    const zone = zones.find(z => z.id === zoneId);
    
    toast({
      title: "Сотрудник отправлен",
      description: `${employee?.fullName} направлен на участок ${zone?.address}`,
    });
    
    setSelectedEmployeeForDispatch(null);
  };

  // Создание нового участка
  const handleCreateZone = () => {
    if (newZone.address) {
      const zone: SecurityZone = {
        id: Math.max(...zones.map(z => z.id)) + 1,
        address: newZone.address,
        status: 'disarmed',
        batteryLevel: 100,
        lastActivity: new Date().toLocaleString('ru-RU'),
        contractStatus: newZone.contractStatus
      };
      setZones(prev => [...prev, zone]);
      setNewZone({ address: '', contractStatus: 'active' });
      toast({
        title: "Участок создан",
        description: `Новый участок ${zone.address} добавлен`,
      });
    }
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
      suspended: { variant: 'outline' as const, text: 'Приостановлен', icon: 'Pause' },
      responding: { variant: 'default' as const, text: 'Выезд', icon: 'Car' }
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Главная</TabsTrigger>
            <TabsTrigger value="zones">Управление участками</TabsTrigger>
            <TabsTrigger value="monitoring">Мониторинг системы</TabsTrigger>
            <TabsTrigger value="alarm">Управление сигнализацией</TabsTrigger>
            <TabsTrigger value="emergency">Тревога</TabsTrigger>
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
                <CardDescription>Массовые операции с участками ({selectedZones.length} выбрано)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleSelectAllZones}>
                      {selectedZones.length === zones.length ? 'Снять выделение' : 'Выбрать все'}
                    </Button>
                    <span className="text-sm text-gray-500 flex items-center">
                      Выбрано: {selectedZones.length} из {zones.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      onClick={() => handleBulkOperation('arm')}
                      disabled={selectedZones.length === 0}
                    >
                      Поставить на охрану
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleBulkOperation('disarm')}
                      disabled={selectedZones.length === 0}
                    >
                      Снять с охраны
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleBulkOperation('discharge')}
                      disabled={selectedZones.length === 0}
                    >
                      Разрядить батареи
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleBulkOperation('charge')}
                      disabled={selectedZones.length === 0}
                    >
                      Зарядить батареи
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Все участки (400)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedZones.length === zones.length}
                            onChange={handleSelectAllZones}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>№</TableHead>
                        <TableHead>Адрес</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Батарея</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zones.map((zone) => (
                        <TableRow key={zone.id} className={zone.status === 'emergency' ? 'bg-red-50' : zone.status === 'alarm' ? 'bg-yellow-50' : ''}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedZones.includes(zone.id)}
                              onChange={() => handleZoneSelection(zone.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>{zone.id}</TableCell>
                          <TableCell>{zone.address}</TableCell>
                          <TableCell>{getStatusBadge(zone.status)}</TableCell>
                          <TableCell>
                            <div className={`text-sm ${zone.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'}`}>
                              {zone.batteryLevel}%
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Управление сигнализацией */}
          <TabsContent value="alarm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление сигнализацией участков</CardTitle>
                <CardDescription>Тестирование систем сигнализации всех участков</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Участок №{zone.id}</p>
                        <p className="text-sm text-gray-500">{zone.address}</p>
                        <div className="mt-1">{getStatusBadge(zone.status)}</div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleAlarmTest(zone)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Icon name="AlertTriangle" className="mr-2 h-4 w-4" />
                        ТЕСТ
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
                  <Button className="w-full" onClick={handleCreateZone}>Создать участок</Button>
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
                      {zones.map((zone) => (
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
                        <SelectItem value="Рядовой">Рядовой</SelectItem>
                        <SelectItem value="Ефрейтор">Ефрейтор</SelectItem>
                        <SelectItem value="Младший сержант">Младший сержант</SelectItem>
                        <SelectItem value="Сержант">Сержант</SelectItem>
                        <SelectItem value="Старший сержант">Старший сержант</SelectItem>
                        <SelectItem value="Старшина">Старшина</SelectItem>
                        <SelectItem value="Прапорщик">Прапорщик</SelectItem>
                        <SelectItem value="Старший прапорщик">Старший прапорщик</SelectItem>
                        <SelectItem value="Лейтенант">Лейтенант</SelectItem>
                        <SelectItem value="Старший лейтенант">Старший лейтенант</SelectItem>
                        <SelectItem value="Капитан">Капитан</SelectItem>
                        <SelectItem value="Майор">Майор</SelectItem>
                        <SelectItem value="Подполковник">Подполковник</SelectItem>
                        <SelectItem value="Полковник">Полковник</SelectItem>
                        <SelectItem value="Генерал-майор">Генерал-майор</SelectItem>
                        <SelectItem value="Генерал-лейтенант">Генерал-лейтенант</SelectItem>
                        <SelectItem value="Генерал-полковник">Генерал-полковник</SelectItem>
                        <SelectItem value="Генерал армии">Генерал армии</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editingEmployee ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleUpdateEmployee} className="w-full">Сохранить изменения</Button>
                      <Button variant="outline" onClick={() => {setEditingEmployee(null); setNewEmployee({ fullName: '', department: '', rank: '' });}} className="w-full">Отмена</Button>
                    </div>
                  ) : (
                    <Button onClick={handleCreateEmployee} className="w-full">Создать сотрудника</Button>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Список сотрудников</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employees.map((employee) => (
                      <div key={employee.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">{employee.fullName}</p>
                          <p className="text-sm text-gray-500">{employee.department} • {employee.rank}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Icon name="Edit" className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleFireEmployee(employee.id)}
                          >
                            <Icon name="UserX" className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Вкладка Тревога */}
          <TabsContent value="emergency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">🚨 ЦЕНТР ТРЕВОГ</CardTitle>
                <CardDescription>Управление экстренными ситуациями и тревогами ({alarmZonesList.length} активных)</CardDescription>
              </CardHeader>
              <CardContent>
                {alarmZonesList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Shield" className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Нет активных тревог</p>
                    <p className="text-sm">Все участки в штатном режиме</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alarmZonesList.map((zone) => (
                      <Card key={zone.id} className="border-red-200 bg-red-50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-red-800">Участок №{zone.id}</h3>
                              <p className="text-red-700">{zone.address}</p>
                              <div className="mt-2">{getStatusBadge(zone.status)}</div>
                              <p className="text-sm text-gray-600 mt-1">Время: {zone.lastActivity}</p>
                            </div>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" onClick={() => setSelectedZone(zone)}>
                                  <Icon name="Users" className="mr-2 h-4 w-4" />
                                  Отправить сотрудника
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Отправить сотрудника на участок №{zone.id}</DialogTitle>
                                  <DialogDescription>{zone.address}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="text-sm font-medium">Выберите сотрудника для отправки:</div>
                                  <div className="grid gap-2">
                                    {employees.map((employee) => (
                                      <div 
                                        key={employee.id} 
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                          selectedEmployeeForDispatch === employee.id 
                                            ? 'bg-blue-50 border-blue-300' 
                                            : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedEmployeeForDispatch(employee.id)}
                                      >
                                        <p className="font-medium">{employee.fullName}</p>
                                        <p className="text-sm text-gray-500">{employee.department} • {employee.rank}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {selectedEmployeeForDispatch && (
                                    <Button 
                                      onClick={() => handleDispatchEmployee(zone.id, selectedEmployeeForDispatch)}
                                      className="w-full"
                                      variant="default"
                                    >
                                      <Icon name="Send" className="mr-2 h-4 w-4" />
                                      ОТПРАВИТЬ
                                    </Button>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;