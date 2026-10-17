import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  PrintPreviewModal,
  ReportCardPrint,
  AttendanceSheetPrint,
  EmergencyRosterPrint,
} from './index';
import type { Student, StudentPassport } from '@kidscare/shared-types';

const mockStudent: Student = {
  id: 'stu-12345',
  tenantId: 'tenant-demo',
  firstName: 'Ada',
  lastName: 'Yılmaz',
  dateOfBirth: '2021-04-15',
  gender: 'FEMALE',
  notes: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const mockPassport: StudentPassport = {
  bloodType: 'A+',
  allergies: ['Fıstık', 'Süt'],
  dietaryRestrictions: ['Vejetaryen'],
  chronicConditions: ['Astım'],
  regularMedications: [],
  emergencyContacts: [
    {
      id: 'c-1',
      name: 'Ayşe Yılmaz',
      relationship: 'Anne',
      phone: '05551234567',
      isAuthorizedPickup: true,
    },
    {
      id: 'c-2',
      name: 'Mehmet Yılmaz',
      relationship: 'Baba',
      phone: '05559876543',
      isAuthorizedPickup: true,
    },
  ],
};

describe('KidsCare PDF Belge Motoru & Resmi Çıktılar (Spec 0044)', () => {
  describe('PrintPreviewModal', () => {
    it('renders preview modal with title, orientation and printable content', () => {
      render(
        <PrintPreviewModal
          isOpen={true}
          onClose={vi.fn()}
          title="Resmî Evrak Önizleme"
          subtitle="A4 Dikey Baskı Testi"
          orientation="portrait"
        >
          <div data-testid="test-child-doc">Belge İçeriği</div>
        </PrintPreviewModal>,
      );

      expect(screen.getByText('Resmî Evrak Önizleme')).toBeInTheDocument();
      expect(screen.getByText('A4 Dikey Baskı Testi')).toBeInTheDocument();
      expect(screen.getByText('A4 Dikey')).toBeInTheDocument();
      expect(screen.getByTestId('test-child-doc')).toBeInTheDocument();
      expect(screen.getByTestId('printable-content')).toHaveClass('preview-sheet-portrait');
    });

    it('renders landscape orientation class when specified', () => {
      render(
        <PrintPreviewModal
          isOpen={true}
          onClose={vi.fn()}
          title="Yatay Çizelge"
          orientation="landscape"
        >
          <div>Yatay Belge</div>
        </PrintPreviewModal>,
      );

      expect(screen.getByText('A4 Yatay')).toBeInTheDocument();
      expect(screen.getByTestId('printable-content')).toHaveClass('preview-sheet-landscape');
    });

    it('triggers window.print when print button is clicked', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      render(
        <PrintPreviewModal isOpen={true} onClose={vi.fn()} title="Yazdır Testi">
          <div>İçerik</div>
        </PrintPreviewModal>,
      );

      const printButton = screen.getByLabelText('Yazdır veya PDF Kaydet');
      fireEvent.click(printButton);

      expect(printSpy).toHaveBeenCalled();
      printSpy.mockRestore();
    });

    it('triggers onClose when close button is clicked or Escape key pressed', () => {
      const handleClose = vi.fn();
      render(
        <PrintPreviewModal isOpen={true} onClose={handleClose} title="Kapat Testi">
          <div>İçerik</div>
        </PrintPreviewModal>,
      );

      const closeButton = screen.getByLabelText('Kapat');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it('does not render anything when isOpen is false', () => {
      const { container } = render(
        <PrintPreviewModal isOpen={false} onClose={vi.fn()} title="Kapalı Modal">
          <div>Görünmemeli</div>
        </PrintPreviewModal>,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('ReportCardPrint (Dönem Sonu Pedagojik Karnesi)', () => {
    it('renders student info, 6 developmental areas, health passport and signatures', () => {
      render(
        <ReportCardPrint
          student={mockStudent}
          passport={mockPassport}
          tenantName="Yıldızlar Anaokulu"
          period="2026-2027 1. Dönem"
          classroomName="Papatyalar Sınıfı"
          teacherName="Zeynep Öğretmen"
          directorName="Fatma Müdür"
        />,
      );

      // Antet & Student Info
      expect(screen.getByText('Yıldızlar Anaokulu')).toBeInTheDocument();
      expect(screen.getByText(/Pedagojik Gelişim Değerlendirme Raporu/i)).toBeInTheDocument();
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Papatyalar Sınıfı')).toBeInTheDocument();

      // Health Passport
      expect(screen.getByText('A+')).toBeInTheDocument();
      expect(screen.getByText('Fıstık, Süt')).toBeInTheDocument();

      // 6 Pedagogical Areas
      expect(screen.getByText('Dil ve İletişim Becerileri')).toBeInTheDocument();
      expect(screen.getByText('Bilişsel Gelişim & Mantık')).toBeInTheDocument();
      expect(screen.getByText('Motor Becerileri (Kaba & İnce)')).toBeInTheDocument();
      expect(screen.getByText('Sosyal ve Duygusal Gelişim')).toBeInTheDocument();
      expect(screen.getByText('Öz Bakım & Yaşam Becerileri')).toBeInTheDocument();
      expect(screen.getByText('Görsel Sanatlar & Ritim/Müzik')).toBeInTheDocument();

      // Teacher Note & Signatures
      expect(
        screen.getByText(/Öğretmenin Dönem Sonu Pedagojik Değerlendirmesi/i),
      ).toBeInTheDocument();
      expect(screen.getByText('Zeynep Öğretmen')).toBeInTheDocument();
      expect(screen.getByText('Fatma Müdür')).toBeInTheDocument();
    });
  });

  describe('AttendanceSheetPrint (MEB Aylık Yoklama Çizelgesi)', () => {
    it('renders MEB official header, classroom, month days table and statistics', () => {
      render(
        <AttendanceSheetPrint
          classroomName="Güneş Sınıfı"
          year={2026}
          month={10}
          students={[mockStudent]}
          tenantName="Gökkuşağı Kreşi"
          teacherName="Ahmet Öğretmen"
          directorName="Kemal Kurucu"
        />,
      );

      expect(screen.getByText('Gökkuşağı Kreşi')).toBeInTheDocument();
      expect(
        screen.getByText(/Ekim 2026 Aylık Öğrenci Devam-Devamsızlık Çizelgesi/i),
      ).toBeInTheDocument();
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();

      // Table headers
      expect(screen.getByText('Sıra')).toBeInTheDocument();
      expect(screen.getByText('Kütük No')).toBeInTheDocument();
      expect(screen.getByText('Öğrenci Adı Soyadı')).toBeInTheDocument();
      expect(screen.getByText('Cns')).toBeInTheDocument();
      expect(screen.getByText('D.Yılı (Yaş)')).toBeInTheDocument();

      // Demographic summary & dynamic rate
      expect(screen.getByText(/Resmî Devam Ortalaması/i)).toBeInTheDocument();
      expect(screen.getByText(/K: 1, E: 0/i)).toBeInTheDocument();

      // Signatures
      expect(screen.getByText('Ahmet Öğretmen')).toBeInTheDocument();
      expect(screen.getByText('Kemal Kurucu')).toBeInTheDocument();
    });
  });

  describe('EmergencyRosterPrint (Acil Durum & Alerjen Kapı/Gezi Listesi)', () => {
    it('renders emergency hotline, allergens highlight, and contacts', () => {
      render(
        <EmergencyRosterPrint
          classroomName="Bulutlar Sınıfı"
          students={[mockStudent]}
          passportsMap={{ 'stu-12345': mockPassport }}
          tenantName="Minik Kalpler Kreşi"
          emergencyPhone="0212 999 88 77"
        />,
      );

      expect(screen.getByText('Minik Kalpler Kreşi')).toBeInTheDocument();
      expect(
        screen.getByText(/Acil Durum, Kan Grubu, Alerjen ve Veli İrtibat Listesi/i),
      ).toBeInTheDocument();
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('A+')).toBeInTheDocument();
      expect(screen.getByText('Fıstık, Süt')).toBeInTheDocument();
      expect(screen.getByText(/Ayşe Yılmaz/)).toBeInTheDocument();
      expect(screen.getByText('05551234567')).toBeInTheDocument();
      expect(screen.getByText(/0212 999 88 77/)).toBeInTheDocument();
      expect(screen.getByText(/Kişisel Verilerin Korunması \(KVKK\)/i)).toBeInTheDocument();
    });
  });
});
