import Ionicons from "@react-native-vector-icons/ionicons";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";

type Props = {
  value?: { date: string; time: string; days: string[] };
  onChange?: (data: { date: string; time: string; days: string[] }) => void;
};

const CustomDateTimePicker = ({ value, onChange }: Props) => {
  const [showClock, setShowClock] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(value?.days || []);

  const { width } = useWindowDimensions();

  const isLargeDisplay = width > 425;

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCalendar(false);
    if (event.type === "set" && selectedDate) {
      const iso = selectedDate.toISOString();
      setDate(iso);
      setSelectedDays([]); //Clear days when setting date
      emitChange({ date: iso, days: [] });
    }
    if (event.type === "dismissed") {
      setDate('')
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowClock(false);
    if (event.type === "set" && selectedTime) {
      const iso = selectedTime.toISOString();
      setTime(iso);
      emitChange({ time: iso });
    }
    if (event.type === "dismissed") {
      setTime('')
    }
  };

  const toggleDay = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];

    setSelectedDays(updatedDays);
    setDate(''); //Clear date when toggling days
    emitChange({ days: updatedDays, date: '' });
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const customFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const year = date.getFullYear();

    return `${weekday} ${month} ${day}, ${year}`;
  };

  useEffect(() => {
    // Sync internal state when parent value changes
    setDate(value?.date || '');
    setTime(value?.time || '');
    setSelectedDays(value?.days || []);
  }, [value]);

  const emitChange = (updated: Partial<{ date: string; time: string; days: string[] }> = {}) => {
    const newData = {
      date,
      time,
      days: selectedDays,
      ...updated,
    };
    onChange?.(newData);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.dateTimePickerContainer}>
          <View style={styles.dateTimePickerContent}>
            <Text style={styles.dateTimePickerTitle}>
              Time:
            </Text>
            <Pressable
              onPress={() => setShowClock(true)}
              style={styles.dateTimePickerButton}
            >
              <MaterialDesignIcons name="clock-time-four-outline" size={24} color="#2E6F40" />
              <Text style={{ color: 'black', fontSize: 14, marginLeft: 10, }}>
                {time ? new Date(time).toLocaleTimeString() : "Clock"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.dateTimePickerContent}>
            <Text style={styles.dateTimePickerTitle}>
              Date:
            </Text>
            <Pressable
              onPress={() => setShowCalendar(true)}
              style={styles.dateTimePickerButton}
            >
              <Ionicons name="calendar-outline" size={24} color="#2E6F40" />
              <Text style={{ color: 'black', fontSize: 14, marginLeft: 10 }}>
                {date ? customFormattedDate(date) : 'Calendar'}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={[
          styles.daySelection,
          isLargeDisplay && styles.largerDisplayDaySelection
        ]}>
          {daysOfWeek.map((day) => {
            const isSelected = selectedDays.includes(day);

            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                style={[
                  styles.days,
                  { backgroundColor: isSelected ? '#47f031d2' : '#CFFFDC' },
                  isLargeDisplay && styles.largerDisplayDays
                ]}
              >
                <Text>{day}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {showCalendar && (
        <DateTimePicker
          value={date ? new Date(date) : new Date()}
          mode='date'
          display='calendar'
          onChange={handleDateChange}
        />
      )}
      {showClock && (
        <DateTimePicker
          value={date ? new Date(date) : new Date()}
          mode='time'
          display='clock'
          onChange={handleTimeChange}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    height: 'auto',
    width: '100%',
    flexDirection: 'column',
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#56BB73'
  },
  dateTimePickerContainer: {
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 10,
  },
  dateTimePickerContent: {
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  dateTimePickerTitle: {
    marginLeft: 10,
    marginBottom: 2,
    fontSize: 15,
    color: 'black'
  },
  dateTimePickerButton: {
    height: 50,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#CFFFDC',
    textAlign: 'left',
    alignItems: 'center',
    flexDirection: 'row',
    color: '#000000',
    fontSize: 14,
  },
  daySelection: {
    marginTop: 10,
    overflow: 'hidden',
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  days: {
    width: 32,
    height: 32,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 80,
    backgroundColor: '#CFFFDC',
  },
  largerDisplayDaySelection: {
    gap: 15,
  },
  largerDisplayDays: {
    width: 40,
    height: 40,
  }
});

export default CustomDateTimePicker