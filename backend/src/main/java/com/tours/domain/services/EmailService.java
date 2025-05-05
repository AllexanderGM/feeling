package com.tours.domain.services;

import com.tours.domain.dto.booking.BookingResponseDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }
    @Async
    public void sendMailBooking(String destinatario, String nombreUsuario, BookingResponseDTO bookingResponseDTO) throws MessagingException {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            Context contexto = new Context();
            contexto.setVariable("name", nombreUsuario);
            contexto.setVariable("tourName", bookingResponseDTO.getTourName());
            contexto.setVariable("tourDescription", bookingResponseDTO.getTourDescription());
            contexto.setVariable("startDate", bookingResponseDTO.getStartDate().format(formatter));
            contexto.setVariable("endDate", bookingResponseDTO.getEndDate().format(formatter));
            contexto.setVariable("creationDate", bookingResponseDTO.getCreationDate().format(formatter));
            contexto.setVariable("adults", bookingResponseDTO.getAdults());
            contexto.setVariable("children", bookingResponseDTO.getChildren());
            contexto.setVariable("includes", bookingResponseDTO.getIncludes());
            contexto.setVariable("price", bookingResponseDTO.getPrice());
            contexto.setVariable("paymentMethod", bookingResponseDTO.getPaymentMethod());

            String html = templateEngine.process("plantillaCorreo.html", contexto);

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);

            helper.setTo(destinatario);
            helper.setSubject("Confirmación de reserva GT");
            helper.setText(html, true);

            mailSender.send(mensaje);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}