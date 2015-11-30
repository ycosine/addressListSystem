package com.cosine.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.cosine.domain.User;
import com.cosine.services.UserServices;
import com.cosine.utils.ParseMD5;

/**
 * Servlet implementation class LoginServlet
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public LoginServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		System.out.println("loginServlet");
		UserServices us = UserServices.getInstance();
		String username = request.getParameter("username");
		String password = ParseMD5.parseStrToMd5L16(request.getParameter("password"));
		User loginuser = new User(username,password);
		String role = us.login(loginuser);
		String uuid = CommonUtils.uuid();
		User resuser = new User(username,uuid,role);
		request.getSession().setAttribute("isLogin", uuid);
		request.getSession().setAttribute("username", username);
		response.getWriter().append(resuser.toJsonString());
	}

}
